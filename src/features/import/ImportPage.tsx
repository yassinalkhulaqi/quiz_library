import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, CardBody, CardHeader, Icon } from '../../components/ui';
import { parseImport, type ImportFormat, importRowsToQuestions, exportQuestionsJson, exportQuestionsCsv } from '../../services/importExport';
import { cn } from '../../lib/utils';

type Step = 'upload' | 'preview' | 'confirm';

export function ImportPage() {
  const { questions, addQuestions, toast } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<ImportFormat>('json');
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof parseImport>>['rows']>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [duplicates, setDuplicates] = useState<string[]>([]);

  const existingTexts = useMemo(() => new Set(questions.map((q) => q.text.trim().toLowerCase())), [questions]);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseImport(format, text);
    if (parsed.errors.length > 0) {
      setErrors(parsed.errors.slice(0, 20));
      setRows([]);
      setStep('upload');
      toast('error', 'Import failed', `${parsed.errors.length} error(s) found.`);
      return;
    }
    setErrors([]);
    setRows(parsed.rows);
    setSelected(new Set(parsed.rows.map((_, i) => i)));
    const dups = parsed.rows
      .filter((r) => existingTexts.has(r.text.trim().toLowerCase()))
      .map((r) => r.text);
    setDuplicates(dups);
    setStep('preview');
    toast('success', `Parsed ${parsed.rows.length} question(s)`, dups.length ? `${dups.length} may be duplicates` : 'No duplicates detected');
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    const chosen = rows.filter((_, i) => selected.has(i));
    const questions = importRowsToQuestions(chosen);
    addQuestions(questions);
    toast('success', `${questions.length} questions imported`, 'Added to the Question Bank.');
    navigate('/questions');
  };

  const toggleRow = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Import Questions</h1>
          <p className="text-sm text-muted">Bulk import questions from JSON or CSV.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon="download" size="sm" onClick={() => exportQuestionsJson(questions)}>Export JSON</Button>
          <Button variant="outline" icon="download" size="sm" onClick={() => exportQuestionsCsv(questions)}>Export CSV</Button>
        </div>
      </div>

      {step === 'upload' ? (
        <Card>
          <CardHeader title="Upload a file" subtitle="Validates before importing anything" icon={<Icon name="upload" size={18} className="text-brand-500" />} />
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text">Format:</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormat('json')} className={cn('rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors', format === 'json' ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-elevated text-muted')}>JSON</button>
                <button type="button" onClick={() => setFormat('csv')} className={cn('rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors', format === 'csv' ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-elevated text-muted')}>CSV</button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept={format === 'json' ? '.json' : '.csv,text/csv'} className="hidden" onChange={onFileChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-elevated px-6 py-14 transition-colors hover:border-brand-500 hover:bg-brand-500/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                <Icon name="upload" size={26} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-text">Drop your file here or click to browse</p>
                <p className="mt-1 text-xs text-soft">{format === 'json' ? 'Array of question objects' : 'CSV with header row'} · parsed and validated locally</p>
              </div>
            </button>

            {errors.length > 0 ? (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
                <p className="mb-2 text-sm font-semibold text-danger">Found {errors.length} problem(s) — nothing was imported</p>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-elevated p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-soft">JSON format</p>
              <pre className="overflow-x-auto rounded-lg bg-bg p-3 text-[11px] leading-relaxed text-muted">{`[
  {
    "type": "multiple_choice",
    "text": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": ["A"],
    "explanation": "Optional",
    "difficulty": "easy",
    "tags": ["tag1"]
  }
]`}</pre>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-soft">CSV format</p>
              <pre className="overflow-x-auto rounded-lg bg-bg p-3 text-[11px] leading-relaxed text-muted">{`type,question,options,correct,explanation,subject,topic,difficulty,tags
multiple_choice,"What is 2+2?","3|4|5|6","4",,Mathematics,Algebra,easy,"math"`}</pre>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {step === 'preview' ? (
        <Card>
          <CardHeader
            title="Review & Confirm"
            subtitle={`${rows.length} rows parsed${duplicates.length ? ` · ${duplicates.length} possible duplicates` : ''}`}
            icon={<Icon name="check" size={18} className="text-success" />}
            action={<Button variant="ghost" size="xs" onClick={() => setStep('upload')}>Choose another file</Button>}
          />
          <CardBody className="flex flex-col gap-3">
            {duplicates.length > 0 ? (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                <p className="text-xs font-semibold text-warning">Possible duplicates with existing questions:</p>
                <ul className="mt-1 max-h-24 space-y-0.5 overflow-y-auto text-xs text-muted">
                  {duplicates.slice(0, 10).map((d, i) => <li key={i}>• {d.slice(0, 90)}</li>)}
                </ul>
                <p className="mt-1 text-[11px] text-soft">You can uncheck them below before importing.</p>
              </div>
            ) : null}

            <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {rows.map((row, i) => (
                <button key={i} type="button" onClick={() => toggleRow(i)} className={cn('flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors', selected.has(i) ? 'border-brand-500 bg-brand-500/5' : 'border-border bg-elevated opacity-50')}>
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border', selected.has(i) ? 'border-brand-500 bg-brand-500 text-white' : 'border-border bg-surface text-transparent')}>
                    <Icon name="check" size={12} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text">{row.text}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      <Badge tone="info">{row.type.replace('_', ' ')}</Badge>
                      <Badge tone={row.difficulty === 'easy' ? 'success' : row.difficulty === 'medium' ? 'warning' : 'danger'}>{row.difficulty}</Badge>
                      {row.options.length > 0 ? <Badge tone="neutral">{row.options.length} options</Badge> : null}
                      {row.tags.length > 0 ? <Badge tone="neutral">{row.tags.join(', ')}</Badge> : null}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted">{selected.size} of {rows.length} will be imported</span>
              <Button icon="check" disabled={selected.size === 0} onClick={confirmImport}>Import {selected.size} questions</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}