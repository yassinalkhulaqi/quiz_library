import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, CardBody, CardHeader, ConfirmDialog, EmptyState, Icon, Input, Modal, Select } from '../../components/ui';
import { QuestionCard } from '../questions/QuestionComponents';
import { formatDate, uid } from '../../lib/utils';

export function CollectionsPage() {
  const { collections, questions, addCollection, updateCollection, removeCollection, toast } = useApp();
  const [active, setActive] = useState<string | null>(collections[0]?.id ?? null);
  const [createOpen, setCreateOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [removeColId, setRemoveColId] = useState<string | null>(null);
  const [addQId, setAddQId] = useState('');

  const activeCollection = collections.find((c) => c.id === active);
  const activeQuestions = useMemo(
    () => activeCollection?.questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => Boolean(q)) ?? [],
    [activeCollection, questions]
  );

  const createCollection = (name: string, description: string) => {
    addCollection({ id: uid('c'), name, description, questionIds: [], createdAt: Date.now() });
    toast('success', 'Collection created');
    setCreateOpen(false);
  };

  const removeQuestionFromCollection = (questionId: string) => {
    if (!activeCollection) return;
    updateCollection(activeCollection.id, { questionIds: activeCollection.questionIds.filter((id) => id !== questionId) });
    toast('info', 'Question removed');
  };

  const duplicateCollection = (id: string) => {
    const c = collections.find((x) => x.id === id);
    if (!c) return;
    addCollection({ ...c, id: uid('c'), name: `${c.name} (copy)`, createdAt: Date.now() });
    toast('success', 'Collection duplicated');
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Collections</h1>
          <p className="text-sm text-muted">Organize questions into reusable sets.</p>
        </div>
        <Button icon="plus" onClick={() => setCreateOpen(true)}>New Collection</Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${active === c.id ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-surface hover:border-brand-400'}`}
            >
              <div className="flex items-center gap-3">
                <Icon name="folder" className={active === c.id ? 'text-brand-500' : 'text-soft'} />
                <div>
                  <p className="text-sm font-semibold text-text">{c.name}</p>
                  <p className="text-xs text-soft">{c.questionIds.length} questions</p>
                </div>
              </div>
              <Icon name="chevron-right" size={15} className="text-soft" />
            </button>
          ))}
          {collections.length === 0 ? <p className="py-6 text-center text-sm text-soft">No collections yet.</p> : null}
        </div>

        <div className="lg:col-span-3">
          {!activeCollection ? (
            <Card><EmptyState icon="folder" title="Select a collection" description="Choose a collection on the left or create a new one." /></Card>
          ) : (
            <Card>
              <CardHeader
                title={activeCollection.name}
                subtitle={`Created ${formatDate(activeCollection.createdAt)} · ${activeQuestions.length} questions`}
                icon={<Icon name="folder" size={18} className="text-brand-500" />}
                action={
                  <div className="flex gap-2">
                    <Button variant="ghost" size="xs" icon="plus" onClick={() => setAddQuestionOpen(true)}>Add questions</Button>
                    <Button variant="ghost" size="xs" icon="duplicate" onClick={() => duplicateCollection(activeCollection.id)}>Duplicate</Button>
                    <Button variant="ghost" size="xs" icon="trash" className="text-danger" onClick={() => setRemoveColId(activeCollection.id)}>Delete</Button>
                  </div>
                }
              />
              <CardBody className="flex flex-col gap-3">
                {activeQuestions.length === 0 ? (
                  <EmptyState icon="questions" title="No questions yet" description="Add questions from the question bank to this collection." action={<Button icon="plus" size="sm" onClick={() => setAddQuestionOpen(true)}>Add questions</Button>} />
                ) : (
                  activeQuestions.map((q) => (
                    <QuestionCard key={q.id} question={q} onDelete={() => removeQuestionFromCollection(q.id)} />
                  ))
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Collection" icon="folder" size="sm">
        <CollectionForm onDone={createCollection} />
      </Modal>

      {/* Add questions */}
      <Modal open={addQuestionOpen} onClose={() => setAddQuestionOpen(false)} title="Add Questions" icon="plus" size="md">
        <div className="flex flex-col gap-3">
          <Select value={addQId} onChange={(e) => setAddQId(e.target.value)}>
            <option value="">Select a question…</option>
            {questions.map((q) => <option key={q.id} value={q.id}>{q.text.slice(0, 80)}</option>)}
          </Select>
          <Button
            icon="plus"
            disabled={!addQId || !activeCollection}
            onClick={() => {
              if (!activeCollection || !addQId) return;
              updateCollection(activeCollection.id, { questionIds: [...new Set([...activeCollection.questionIds, addQId])] });
              toast('success', 'Question added to collection');
              setAddQId('');
            }}
          >
            Add to "{activeCollection?.name}"
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={removeColId !== null}
        onClose={() => setRemoveColId(null)}
        onConfirm={() => {
          if (!removeColId) return;
          removeCollection(removeColId);
          toast('success', 'Collection deleted');
        }}
        title="Delete collection?"
        message="This removes the collection only; the questions themselves stay in your bank."
      />
    </div>
  );
}

function CollectionForm({ onDone, initial }: { onDone: (name: string, description: string) => void; initial?: { name: string; description: string } }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Collection name (e.g. Midterm, Practice…)" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Button onClick={() => onDone(name.trim(), description.trim())} disabled={!name.trim()}>Create Collection</Button>
    </div>
  );
}