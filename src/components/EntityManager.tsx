import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Check,
  Clipboard,
  FileJson,
  FileText,
  Globe2,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  DEFAULT_ENTITY_PROFILE,
  ENTITY_AUDIT_STORAGE_KEY,
  ENTITY_PROFILE_STORAGE_KEY,
  directoryCsv,
  entityCompleteness,
  entityJsonCsv,
  findLegacyDomainReferences,
  generateDirectoryExport,
  generateEntityJson,
  generateEntitySchema,
  generateOpenGraph,
  generateTwitterCard,
  generateWikidataExport,
  isValidHttpsUrl,
  normalizeAuditEvents,
  normalizeEntityProfile,
  validateEntityProfile,
  type EntityAuditEvent,
  type EntityProfile,
  type OfficialProfile,
  type SocialProfile,
  type ValidationIssue,
} from '../data/entityManager';
import { SITE_URL } from '../data/siteIdentity';

type PreviewTab = 'schema' | 'json' | 'open-graph' | 'entity' | 'wikidata' | 'directory';

const inputClass = 'mt-1.5 min-h-10 w-full rounded-md border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#FF5E00] focus-visible:ring-2 focus-visible:ring-[#FF5E00]/50';
const labelClass = 'block min-w-0 text-xs font-semibold text-neutral-300';
const secondaryButtonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:border-white/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-45';
const primaryButtonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#FF5E00] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#FF6A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] disabled:cursor-not-allowed disabled:opacity-45';

const previewTabs: Array<{ id: PreviewTab; label: string }> = [
  { id: 'schema', label: 'Schema Preview' },
  { id: 'json', label: 'JSON Preview' },
  { id: 'open-graph', label: 'Open Graph Preview' },
  { id: 'entity', label: 'Entity Preview' },
  { id: 'wikidata', label: 'Wikidata Export' },
  { id: 'directory', label: 'Directory Export' },
];

function makeId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function readStorage(key: string): string | null {
  return window.localStorage.getItem(key);
}

function upsertField<K extends keyof EntityProfile>(profile: EntityProfile, field: K, value: EntityProfile[K]): EntityProfile {
  return { ...profile, [field]: value };
}

function updateListItem<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className={labelClass}>
    {label}
    {children}
    {hint && <span className="mt-1 block text-[11px] font-normal leading-4 text-neutral-500">{hint}</span>}
  </label>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  hint?: string;
  required?: boolean;
}) {
  return <Field label={label} hint={hint}>
    <input
      className={inputClass}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      autoComplete="off"
    />
  </Field>;
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return <Field label={label} hint={hint}>
    <textarea
      className={`${inputClass} min-h-24 resize-y`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  </Field>;
}

function SplitListField({
  label,
  values,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  return <TextField
    label={label}
    value={values.join(', ')}
    placeholder={placeholder}
    hint={hint}
    onChange={(value) => onChange(value.split(',').map((part) => part.trim()).filter(Boolean))}
  />;
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return <div className="mb-4">
    <h2 className="text-base font-bold text-white">{title}</h2>
    {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-400">{description}</p>}
  </div>;
}

function addAuditEvent(current: EntityAuditEvent[], action: EntityAuditEvent['action']): EntityAuditEvent[] {
  return [...current, { id: makeId('event'), action, createdAt: new Date().toISOString() }].slice(-100);
}

function downloadText(filename: string, contents: string, type: string): void {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const EntityManager: React.FC = () => {
  const [profile, setProfile] = useState<EntityProfile>(DEFAULT_ENTITY_PROFILE);
  const [auditEvents, setAuditEvents] = useState<EntityAuditEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState<PreviewTab>('schema');
  const [validationRun, setValidationRun] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedProfile = readStorage(ENTITY_PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsed: unknown = JSON.parse(savedProfile);
        const normalized = normalizeEntityProfile(parsed);
        if (!normalized) throw new Error('Saved entity profile has an unsupported format.');
        setProfile(normalized);
      }
      const savedEvents = readStorage(ENTITY_AUDIT_STORAGE_KEY);
      if (savedEvents) setAuditEvents(normalizeAuditEvents(JSON.parse(savedEvents)));
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : 'Browser storage is unavailable. Export your work before closing this page.');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const validation = useMemo(() => validateEntityProfile(profile), [profile]);
  const completeness = useMemo(() => entityCompleteness(profile), [profile]);
  const completionScore = completeness.length
    ? Math.round(completeness.reduce((sum, category) => sum + category.percent, 0) / completeness.length)
    : 0;
  const hasErrors = validation.some((issue) => issue.status === 'ERROR');
  const schemaPreview = useMemo(() => JSON.stringify(generateEntitySchema(profile), null, 2), [profile]);
  const jsonPreview = useMemo(() => JSON.stringify(profile, null, 2), [profile]);
  const entityPreview = useMemo(() => JSON.stringify(generateEntityJson(profile), null, 2), [profile]);
  const wikidataPreview = useMemo(() => JSON.stringify(generateWikidataExport(profile), null, 2), [profile]);
  const directoryPreview = useMemo(() => JSON.stringify(generateDirectoryExport(profile), null, 2), [profile]);
  const graph = generateEntitySchema(profile)['@graph'] as Array<Record<string, unknown>>;
  const openGraphPreview = generateOpenGraph(profile);
  const twitterPreview = generateTwitterCard(profile);
  const legacyReferences = findLegacyDomainReferences(profile);

  const updateProfile = <K extends keyof EntityProfile>(field: K, value: EntityProfile[K]) => {
    setProfile((current) => upsertField(current, field, value));
    setIsDirty(true);
    setSaved(false);
    setError('');
    setNotice('');
  };

  const saveAuditEvents = (nextEvents: EntityAuditEvent[]) => {
    try {
      window.localStorage.setItem(ENTITY_AUDIT_STORAGE_KEY, JSON.stringify(nextEvents));
      setAuditEvents(nextEvents);
      return true;
    } catch {
      setError('The local audit log could not be updated; this action will not be recorded.');
      return false;
    }
  };

  const saveProfile = () => {
    if (!isLoaded) return;
    try {
      const existed = Boolean(window.localStorage.getItem(ENTITY_PROFILE_STORAGE_KEY));
      window.localStorage.setItem(ENTITY_PROFILE_STORAGE_KEY, JSON.stringify({ version: 1, profile }));
      const nextEvents = addAuditEvent(auditEvents, existed ? 'Updated' : 'Created');
      const auditSaved = saveAuditEvents(nextEvents);
      setIsDirty(false);
      setSaved(true);
      setNotice('Entity profile saved in this browser only.');
      if (auditSaved) setError('');
    } catch (storageError) {
      setError(storageError instanceof Error
        ? `Could not save entity data in this browser: ${storageError.message}`
        : 'Could not save entity data in this browser. Export your work or free browser storage.');
    }
  };

  const runValidation = () => {
    setValidationRun(true);
    saveAuditEvents(addAuditEvent(auditEvents, 'Validated'));
    setNotice(hasErrors ? 'Validation finished. Resolve the errors before exporting.' : 'Validation finished. Review warnings before exporting.');
  };

  const recordExport = () => {
    saveAuditEvents(addAuditEvent(auditEvents, 'Exported'));
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      recordExport();
      setNotice(`${label} copied to clipboard.`);
      setError('');
    } catch {
      setError(`Could not copy ${label}. Use the download button instead.`);
    }
  };

  const doDownload = (filename: string, value: string, type: string) => {
    try {
      downloadText(filename, value, type);
      recordExport();
      setNotice(`${filename} downloaded for review.`);
      setError('');
    } catch {
      setError(`Could not download ${filename}.`);
    }
  };

  const updateSocial = (id: string, patch: Partial<SocialProfile>) => {
    updateProfile('socialProfiles', updateListItem(profile.socialProfiles, id, patch));
  };

  const updateOfficial = (id: string, patch: Partial<OfficialProfile>) => {
    updateProfile('officialProfiles', updateListItem(profile.officialProfiles, id, patch));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const normalized = normalizeEntityProfile(parsed);
      if (!normalized) throw new Error('The selected file is not an entity profile JSON.');
      if (!window.confirm('Import this profile and replace the current unsaved form values? The existing saved profile remains until you choose Save.')) return;
      setProfile(normalized);
      setIsDirty(true);
      setSaved(false);
      setNotice('Profile imported into the editor. Review validation and save to keep it in this browser.');
      setError('');
    } catch (importError) {
      setError(importError instanceof Error ? `Import failed: ${importError.message}` : 'Import failed because the selected file could not be read.');
    }
  };

  const resetProfile = () => {
    if (!window.confirm('Reset the local Entity Manager profile and audit log? This removes this browser’s saved entity data.')) return;
    try {
      window.localStorage.removeItem(ENTITY_PROFILE_STORAGE_KEY);
      window.localStorage.removeItem(ENTITY_AUDIT_STORAGE_KEY);
      setProfile(DEFAULT_ENTITY_PROFILE);
      setAuditEvents([]);
      setIsDirty(false);
      setSaved(false);
      setValidationRun(false);
      setNotice('Local entity data was reset.');
      setError('');
    } catch (resetError) {
      setError(resetError instanceof Error ? `Could not reset local data: ${resetError.message}` : 'Could not reset local data in this browser.');
    }
  };

  const issueStatusClass = (status: ValidationIssue['status']) => (
    status === 'ERROR' ? 'text-rose-300 border-rose-400/20 bg-rose-500/5'
      : status === 'WARNING' ? 'text-amber-200 border-amber-400/20 bg-amber-500/5'
        : 'text-emerald-300 border-emerald-400/20 bg-emerald-500/5'
  );

  const contentForTab = () => {
    if (activeTab === 'schema') return schemaPreview;
    if (activeTab === 'json') return jsonPreview;
    if (activeTab === 'entity') return entityPreview;
    if (activeTab === 'wikidata') return wikidataPreview;
    if (activeTab === 'directory') return directoryPreview;
    return JSON.stringify({ openGraph: openGraphPreview, twitterCard: twitterPreview }, null, 2);
  };

  const downloadForTab = () => {
    if (activeTab === 'schema') doDownload('entity-schema.jsonld', schemaPreview, 'application/ld+json');
    else if (activeTab === 'json') doDownload('entity-profile.json', jsonPreview, 'application/json');
    else if (activeTab === 'entity') doDownload('entity.json', entityPreview, 'application/json');
    else if (activeTab === 'wikidata') doDownload('wikidata-review.json', wikidataPreview, 'application/json');
    else if (activeTab === 'directory') doDownload('business-brand-profile.json', directoryPreview, 'application/json');
    else doDownload('social-metadata.json', contentForTab(), 'application/json');
  };

  const tabPanelLabel = previewTabs.find((tab) => tab.id === activeTab)?.label ?? 'Preview';
  const visibleIssues = validationRun ? validation : validation.filter((issue) => issue.status !== 'PASS');

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* ENTITY MANAGER UI CONTRACT
          THESIS: One editable source of truth; no fake completeness claims or auto-publishing.
          OWN-WORLD: SEOX AI’s dark graphite working surface, orange actions, precise borders and compact type.
          STORY: Enter confirmed facts, inspect conflicts, review generated artifacts, then export deliberately.
          FIRST VIEWPORT: Title and local-storage notice above editor fields; validation remains visible beside them.
          FORM: Responsive two-column operator workspace, inherited from the existing SEO Tools interface. */}
      <header className="border-b border-white/[0.08] bg-[#0B0B0B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-8">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
              <a href="/" className="hover:text-white">Home</a><span aria-hidden="true">/</span>
              <a href="/seo-tools/" className="hover:text-white">SEO Tools</a><span aria-hidden="true">/</span>
              <span className="text-neutral-200">Entity Manager</span>
            </nav>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Entity Manager</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
              Manage your brand identity, generate structured data and keep your entity information consistent across the web.
            </p>
            <p className="mt-3 inline-flex items-start gap-2 text-xs leading-5 text-neutral-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8A3D]" />
              This profile is stored only in this browser. The current sign-in screen does not provide account protection or server sync.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondaryButtonClass} onClick={() => importInput.current?.click()}>
              <Upload className="h-4 w-4" /> Import JSON
            </button>
            <input ref={importInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} />
            <button type="button" className={secondaryButtonClass} onClick={resetProfile}>
              <RotateCcw className="h-4 w-4" /> Reset Entity Data
            </button>
            <button type="button" className={primaryButtonClass} disabled={!isLoaded || !isDirty} onClick={saveProfile}>
              <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save locally'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {(error || notice) && <div className={`mb-5 flex items-start gap-2 rounded-md border p-3 text-sm ${error ? 'border-rose-400/25 bg-rose-500/5 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200'}`} role={error ? 'alert' : 'status'}>
          {error ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{error || notice}</span>
          <button type="button" className="ml-auto rounded p-1 hover:bg-white/5" aria-label="Dismiss message" onClick={() => { setError(''); setNotice(''); }}><X className="h-4 w-4" /></button>
        </div>}

        {legacyReferences.length > 0 && <section className="mb-5 border border-rose-400/25 bg-rose-500/5 p-4" aria-labelledby="legacy-warning-title">
          <h2 id="legacy-warning-title" className="flex items-center gap-2 text-sm font-bold text-rose-200">
            <AlertTriangle className="h-4 w-4" /> Legacy domain reference detected
          </h2>
          <p className="mt-1 text-xs leading-5 text-neutral-300">The entered values are preserved. Update them manually; generated downloads are disabled until these references are resolved.</p>
          <ul className="mt-2 space-y-1 text-xs text-rose-100">
            {legacyReferences.map((reference) => <li key={reference.path}><code>{reference.path}</code>: <code>{reference.value}</code></li>)}
          </ul>
        </section>}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 space-y-8">
            <section aria-labelledby="basic-information">
              <SectionHeading title="Basic Information" description="Start with confirmed public facts. Values marked optional stay out of output when blank." />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Entity / Brand Name" value={profile.entityName} required onChange={(value) => updateProfile('entityName', value)} placeholder="SEOX AI" />
                <TextField label="Official Website" value={profile.websiteUrl} required type="url" onChange={(value) => updateProfile('websiteUrl', value)} hint={`Production canonical: ${SITE_URL}`} />
                <TextAreaField label="Short Description" value={profile.shortDescription} onChange={(value) => updateProfile('shortDescription', value)} rows={2} />
                <TextAreaField label="Long Description" value={profile.longDescription} onChange={(value) => updateProfile('longDescription', value)} rows={2} />
                <Field label="Entity Type">
                  <select className={inputClass} value={profile.entityType} onChange={(event) => updateProfile('entityType', event.target.value as EntityProfile['entityType'])}>
                    <option value="Organization">Organization</option>
                    <option value="SoftwareApplication">Software</option>
                    <option value="Brand">Brand</option>
                    <option value="Product">Product</option>
                  </select>
                </Field>
                <TextField label="Primary Category" value={profile.primaryCategory} onChange={(value) => updateProfile('primaryCategory', value)} placeholder="SEO Software" />
                <SplitListField label="Secondary Categories" values={profile.secondaryCategories} onChange={(value) => updateProfile('secondaryCategories', value)} placeholder="Separate values with commas" />
                <TextField label="Country" value={profile.country} onChange={(value) => updateProfile('country', value)} />
                <TextField label="Language" value={profile.language} onChange={(value) => updateProfile('language', value)} placeholder="vi-VN" />
                <SplitListField label="Alternative Names / Aliases" values={profile.aliases} onChange={(value) => updateProfile('aliases', value)} placeholder="Separate aliases with commas" />
              </div>
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="brand-identity">
              <SectionHeading title="Brand Identity" />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Logo URL" value={profile.logoUrl} type="url" onChange={(value) => updateProfile('logoUrl', value)} hint="Use an absolute HTTPS image URL." />
                <TextField label="Favicon URL" value={profile.faviconUrl} type="url" onChange={(value) => updateProfile('faviconUrl', value)} />
                <TextField label="Brand Image URL" value={profile.brandImageUrl} type="url" onChange={(value) => updateProfile('brandImageUrl', value)} hint="Used for Open Graph and Twitter image when valid." />
                <TextField label="Tagline" value={profile.tagline} onChange={(value) => updateProfile('tagline', value)} />
                <Field label="Primary Color">
                  <div className="mt-1.5 flex h-10 items-center gap-3 rounded-md border border-white/10 bg-[#080808] px-3">
                    <input aria-label="Primary color" className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" type="color" value={profile.primaryColor} onChange={(event) => updateProfile('primaryColor', event.target.value)} />
                    <span className="font-mono text-xs text-neutral-300">{profile.primaryColor}</span>
                  </div>
                </Field>
                <Field label="Secondary Color">
                  <div className="mt-1.5 flex h-10 items-center gap-3 rounded-md border border-white/10 bg-[#080808] px-3">
                    <input aria-label="Secondary color" className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" type="color" value={profile.secondaryColor} onChange={(event) => updateProfile('secondaryColor', event.target.value)} />
                    <span className="font-mono text-xs text-neutral-300">{profile.secondaryColor}</span>
                  </div>
                </Field>
              </div>
              <div className="mt-5 flex min-h-20 items-center gap-4 border-y border-white/[0.08] py-4">
                {isValidHttpsUrl(profile.logoUrl)
                  ? <img src={profile.logoUrl} alt="" referrerPolicy="no-referrer" className="h-12 w-12 rounded-md border border-white/10 object-contain" />
                  : <span className="flex h-12 w-12 items-center justify-center rounded-md border border-[#FF5E00]/25 bg-[#FF5E00]/10 text-lg font-black text-[#FF8A3D]">S</span>}
                <div>
                  <p className="font-bold text-white">{profile.entityName || 'Entity name'}</p>
                  {profile.tagline && <p className="mt-1 text-xs text-neutral-400">{profile.tagline}</p>}
                  {profile.logoUrl && !isValidHttpsUrl(profile.logoUrl) && <p className="mt-1 text-xs text-amber-200">Logo preview unavailable until the URL is valid HTTPS.</p>}
                </div>
              </div>
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="organization">
              <SectionHeading title="Organization" description="Founder, legal name, dates and address are optional. Blank fields are never generated." />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Legal Name" value={profile.legalName} onChange={(value) => updateProfile('legalName', value)} />
                <TextField label="Alternate Name" value={profile.alternateName} onChange={(value) => updateProfile('alternateName', value)} />
                <TextField label="Founder" value={profile.founder} onChange={(value) => updateProfile('founder', value)} />
                <TextField label="Founding Date" value={profile.foundingDate} onChange={(value) => updateProfile('foundingDate', value)} type="text" placeholder="YYYY-MM-DD" />
                <TextField label="Organization Type" value={profile.organizationType} onChange={(value) => updateProfile('organizationType', value)} />
                <TextField label="Address" value={profile.address} onChange={(value) => updateProfile('address', value)} />
                <TextField label="City" value={profile.city} onChange={(value) => updateProfile('city', value)} />
                <TextField label="Organization Country" value={profile.organizationCountry} onChange={(value) => updateProfile('organizationCountry', value)} />
                <TextField label="Postal Code" value={profile.postalCode} onChange={(value) => updateProfile('postalCode', value)} />
              </div>
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="contact">
              <SectionHeading title="Contact" description="Only include contact details you are authorized to publish." />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Email" value={profile.email} onChange={(value) => updateProfile('email', value)} type="email" />
                <TextField label="Phone" value={profile.phone} onChange={(value) => updateProfile('phone', value)} type="tel" />
                <TextField label="Contact URL" value={profile.contactUrl} onChange={(value) => updateProfile('contactUrl', value)} type="url" />
              </div>
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="social-profiles">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionHeading title="Social Profiles" description="Only approved HTTPS links are included in sameAs. Approval is your confirmation that the profile is verified and public." />
                <button type="button" className={secondaryButtonClass} onClick={() => updateProfile('socialProfiles', [...profile.socialProfiles, { id: makeId('social'), platform: '', url: '', approved: false }])}>
                  <Plus className="h-4 w-4" /> Add Social Profile
                </button>
              </div>
              {profile.socialProfiles.length === 0 ? <p className="border-y border-white/[0.08] py-4 text-sm text-neutral-500">No social profiles added. None will be inferred.</p> : <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {profile.socialProfiles.map((item) => <div key={item.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(8rem,0.5fr)_minmax(12rem,1fr)_auto] sm:items-end">
                  <TextField label="Platform" value={item.platform} onChange={(value) => updateSocial(item.id, { platform: value })} placeholder="GitHub, X, LinkedIn…" />
                  <TextField label="Profile URL" value={item.url} onChange={(value) => updateSocial(item.id, { url: value })} type="url" />
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <label className="inline-flex min-h-10 items-center gap-2 text-xs text-neutral-300">
                      <input type="checkbox" checked={item.approved} onChange={(event) => updateSocial(item.id, { approved: event.target.checked })} className="accent-[#FF5E00]" />
                      Verified / approved
                    </label>
                    <button type="button" className="rounded p-2 text-neutral-400 hover:bg-white/5 hover:text-rose-300" aria-label={`Remove ${item.platform || 'social'} profile`} onClick={() => updateProfile('socialProfiles', profile.socialProfiles.filter((entry) => entry.id !== item.id))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>)}
              </div>}
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="official-profiles">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionHeading title="Official Profiles" description="Only profiles marked official, verified and public are eligible for sameAs and external exports." />
                <button type="button" className={secondaryButtonClass} onClick={() => updateProfile('officialProfiles', [...profile.officialProfiles, { id: makeId('official'), platform: '', url: '', official: false, verified: false, isPublic: false }])}>
                  <Plus className="h-4 w-4" /> Add Official Profile
                </button>
              </div>
              {profile.officialProfiles.length === 0 ? <p className="border-y border-white/[0.08] py-4 text-sm text-neutral-500">No official profiles added.</p> : <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {profile.officialProfiles.map((item) => <div key={item.id} className="grid gap-3 py-4 lg:grid-cols-[minmax(8rem,0.4fr)_minmax(12rem,1fr)_auto] lg:items-end">
                  <TextField label="Profile" value={item.platform} onChange={(value) => updateOfficial(item.id, { platform: value })} placeholder="Documentation, Support…" />
                  <TextField label="Profile URL" value={item.url} onChange={(value) => updateOfficial(item.id, { url: value })} type="url" />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {([
                      ['official', 'Official'],
                      ['verified', 'Verified'],
                      ['isPublic', 'Public'],
                    ] as const).map(([key, label]) => <label key={key} className="inline-flex min-h-8 items-center gap-2 text-xs text-neutral-300">
                      <input type="checkbox" checked={item[key]} onChange={(event) => updateOfficial(item.id, { [key]: event.target.checked })} className="accent-[#FF5E00]" />
                      {label}
                    </label>)}
                    <button type="button" className="rounded p-2 text-neutral-400 hover:bg-white/5 hover:text-rose-300" aria-label={`Remove ${item.platform || 'official'} profile`} onClick={() => updateProfile('officialProfiles', profile.officialProfiles.filter((entry) => entry.id !== item.id))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>)}
              </div>}
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="software-application">
              <SectionHeading title="SEO & Structured Data" description="Application category and operating system use the declared product defaults. No rating or review fields are generated." />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Application Name" value={profile.applicationName} onChange={(value) => updateProfile('applicationName', value)} />
                <TextField label="Application Category" value={profile.applicationCategory} onChange={(value) => updateProfile('applicationCategory', value)} />
                <TextField label="Operating System" value={profile.operatingSystem} onChange={(value) => updateProfile('operatingSystem', value)} />
                <TextField label="Application URL" value={profile.applicationUrl} onChange={(value) => updateProfile('applicationUrl', value)} type="url" hint="Generated output uses the fixed production canonical URL." />
                <TextAreaField label="Application Description" value={profile.applicationDescription} onChange={(value) => updateProfile('applicationDescription', value)} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Price" value={profile.price} onChange={(value) => updateProfile('price', value)} type="number" />
                  <TextField label="Currency" value={profile.currency} onChange={(value) => updateProfile('currency', value)} />
                </div>
              </div>
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="sources">
              <SectionHeading title="Sources & Identifiers" description="Reference URLs help reviewers verify claims. No Wikidata IDs or external identifiers are inferred." />
              <div className="grid gap-4 sm:grid-cols-2">
                <SplitListField label="Source URLs" values={profile.sourceUrls} onChange={(value) => updateProfile('sourceUrls', value)} placeholder="https://source.example/page, ..." />
                <SplitListField label="Other Identifiers" values={profile.otherIdentifiers} onChange={(value) => updateProfile('otherIdentifiers', value)} placeholder="Only identifiers you can verify" />
              </div>
            </section>

            <section className="border-t border-white/[0.08] pt-7" aria-labelledby="about-profile">
              <SectionHeading title="About / Brand Profile" description="Editable draft based on the facts you supplied. Review it before publishing; nothing is sent to third parties." />
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-amber-200"><FileText className="h-4 w-4" />Generated draft from saved profile facts — review before publishing.</p>
              <div className="grid gap-4">
                <TextAreaField label={`About ${profile.entityName || 'the entity'}`} value={profile.aboutDraft} onChange={(value) => updateProfile('aboutDraft', value)} />
                <TextAreaField label="What it does" value={profile.productDraft} onChange={(value) => updateProfile('productDraft', value)} placeholder="Describe only confirmed products and capabilities." />
                <TextAreaField label="Products and SEO Tools" value={profile.toolsDraft} onChange={(value) => updateProfile('toolsDraft', value)} placeholder="List actual products or tools; do not add unsupported claims." />
                <TextAreaField label="Contact and official profiles" value={profile.contactDraft} onChange={(value) => updateProfile('contactDraft', value)} placeholder="Optional public contact/profile copy." />
              </div>
            </section>
          </div>

          <aside className="min-w-0 xl:sticky xl:top-5 xl:self-start">
            <section aria-labelledby="entity-completeness" className="border-t border-white/[0.08] pt-4 xl:border-t-0 xl:pt-0">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="entity-completeness" className="text-sm font-bold text-white">Entity Completeness</h2>
                <span className="font-mono text-lg font-bold text-[#FF8A3D]">{completionScore}%</span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-neutral-500">SEOX AI entity data completeness. Not a Google ranking score.</p>
              <div className="mt-3 h-1.5 overflow-hidden bg-white/10" role="progressbar" aria-label="SEOX AI entity data completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionScore}>
                <div className="h-full bg-[#FF5E00] transition-[width]" style={{ width: `${completionScore}%` }} />
              </div>
              <dl className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {completeness.map((category) => <div key={category.name} className="flex items-center justify-between gap-3 py-2 text-xs">
                  <dt className="text-neutral-300">{category.name}</dt>
                  <dd className={category.percent === 100 ? 'text-emerald-300' : 'text-neutral-500'}>{category.percent === 100 ? 'Complete' : 'Not complete'}</dd>
                </div>)}
              </dl>
            </section>

            <section className="mt-7 border-t border-white/[0.08] pt-4" aria-labelledby="entity-validation">
              <div className="flex items-center justify-between gap-3">
                <h2 id="entity-validation" className="text-sm font-bold text-white">Entity Validation</h2>
                <button type="button" className={secondaryButtonClass} onClick={runValidation}><BadgeCheck className="h-4 w-4" /> Validate</button>
              </div>
              <div className="mt-3 space-y-2">
                {visibleIssues.length === 0
                  ? <p className="py-3 text-xs leading-5 text-neutral-500">No findings yet. Run validation to review the generated schema and profile.</p>
                  : visibleIssues.map((issue, index) => <div key={`${issue.code}-${issue.path}-${index}`} className={`border px-3 py-2.5 ${issueStatusClass(issue.status)}`}>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold tracking-wide">
                      <span>{issue.status}</span><code className="max-w-[12rem] truncate font-normal">{issue.path}</code>
                    </div>
                    <p className="mt-1 text-xs leading-5">{issue.message}</p>
                  </div>)}
              </div>
              {validationRun && !hasErrors && <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300"><Check className="h-4 w-4" /> No blocking validation errors.</p>}
            </section>

            <section className="mt-7 border-t border-white/[0.08] pt-4" aria-labelledby="entity-audit-log">
              <div className="flex items-center justify-between gap-3">
                <h2 id="entity-audit-log" className="text-sm font-bold text-white">Local Audit Log</h2>
                <span className="text-[10px] text-neutral-500">No profile values stored here</span>
              </div>
              {auditEvents.length === 0
                ? <p className="mt-3 text-xs text-neutral-500">No saved actions.</p>
                : <ol className="mt-2 max-h-52 divide-y divide-white/[0.06] overflow-y-auto">
                  {[...auditEvents].reverse().slice(0, 20).map((entry) => <li key={entry.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                    <span className="text-neutral-300">{entry.action}</span>
                    <time className="text-neutral-500" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
                  </li>)}
                </ol>}
            </section>
          </aside>
        </div>

        <section className="mt-10 border-t border-white/[0.08] pt-7" aria-labelledby="entity-export">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="entity-export" className="text-xl font-bold text-white">Review & Export</h2>
              <p className="mt-1 text-sm text-neutral-400">Generated outputs use approved, valid facts only. Export is blocked while validation has errors.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => void copyText(contentForTab(), tabPanelLabel)}>
                <Clipboard className="h-4 w-4" /> Copy {activeTab === 'schema' ? 'JSON-LD' : tabPanelLabel}
              </button>
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={downloadForTab}>
                <ArrowDownToLine className="h-4 w-4" /> Download
              </button>
            </div>
          </div>

          <div role="tablist" aria-label="Entity output previews" className="mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.08]">
            {previewTabs.map((tab) => <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              aria-controls="entity-preview-panel"
              id={`entity-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-10 shrink-0 border-b-2 px-3 text-xs font-semibold transition-colors ${activeTab === tab.id ? 'border-[#FF5E00] text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
            >{tab.label}</button>)}
          </div>
          <div role="tabpanel" id="entity-preview-panel" aria-labelledby={`entity-tab-${activeTab}`} className="mt-4">
            {activeTab === 'open-graph' ? <div className="grid gap-6 lg:grid-cols-2">
              <dl className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {[...Object.entries(openGraphPreview), ...Object.entries(twitterPreview)].map(([key, value]) => <div key={key} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-2.5 text-xs">
                  <dt className="font-mono text-neutral-400">{key}</dt><dd className="break-all text-neutral-200">{value || 'Not generated'}</dd>
                </div>)}
              </dl>
              <pre className="max-h-[28rem] overflow-auto border border-white/[0.08] bg-[#0C0C0C] p-4 text-xs leading-5 text-neutral-200"><code>{contentForTab()}</code></pre>
            </div> : <pre className="max-h-[32rem] overflow-auto border border-white/[0.08] bg-[#0C0C0C] p-4 text-xs leading-5 text-neutral-200"><code>{contentForTab()}</code></pre>}
            {activeTab === 'wikidata' && <div className="mt-4 border border-amber-400/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100">
              Review all information and confirm notability/source requirements before submitting to Wikidata. This tool does not submit or edit Wikidata.
            </div>}
            {activeTab === 'directory' && <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => doDownload('business-brand-profile.csv', directoryCsv(profile), 'text/csv')}><FileText className="h-4 w-4" /> Download CSV</button>
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => doDownload('business-brand-profile.txt', JSON.stringify(generateDirectoryExport(profile), null, 2), 'text/plain')}><FileText className="h-4 w-4" /> Download TXT</button>
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => void copyText(directoryPreview, 'business/brand profile')}><Clipboard className="h-4 w-4" /> Copy profile</button>
            </div>}
            {activeTab === 'entity' && <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => doDownload('entity-profile.csv', entityJsonCsv(profile), 'text/csv')}><FileText className="h-4 w-4" /> Download CSV</button>
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => doDownload('entity.json', entityPreview, 'application/json')}><FileJson className="h-4 w-4" /> Download entity.json</button>
            </div>}
            {activeTab === 'json' && <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} disabled={hasErrors} onClick={() => doDownload('entity-profile.txt', jsonPreview, 'text/plain')}><FileText className="h-4 w-4" /> Download TXT</button>
              <p className="self-center text-xs text-neutral-500">Contains the complete local profile; review before sharing because it may include private contact fields.</p>
            </div>}
            {activeTab === 'schema' && <p className="mt-3 text-xs text-neutral-500">One @graph contains WebSite, Organization, SoftwareApplication and BreadcrumbList. Optional properties are omitted unless supplied.</p>}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-neutral-500">
            <Globe2 className="mt-0.5 h-4 w-4 shrink-0" />
            Exports prepare reviewed data for manual publication. There is no automated social, directory or Wikidata submission.
          </p>
        </section>

        <nav aria-label="Related SEO tools" className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.08] pt-5 text-sm">
          <a className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white" href="/seo-tools/schema-checker/">Schema Checker <ArrowRight className="h-3.5 w-3.5 text-[#FF8A3D]" /></a>
          <a className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white" href="/seo-tools/domain-checker/">Domain Checker <ArrowRight className="h-3.5 w-3.5 text-[#FF8A3D]" /></a>
          <a className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white" href="/seo-tools/meta-tag-checker/">Meta Tag Checker <ArrowRight className="h-3.5 w-3.5 text-[#FF8A3D]" /></a>
          <a className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white" href="/seo-tools/seo-checker/">SEO Checker <ArrowRight className="h-3.5 w-3.5 text-[#FF8A3D]" /></a>
          <a className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white" href="/seo-tools/technical-seo-checker/">Technical SEO <ArrowRight className="h-3.5 w-3.5 text-[#FF8A3D]" /></a>
        </nav>
      </main>
    </div>
  );
};
