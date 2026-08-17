import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp, useDebounced } from '../../context/AppContext';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Modal,
  SearchInput,
  Select,
  Tabs,
} from '../../components/ui';
import { SUBJECTS, TOPICS, topicName, topicsForSubject } from '../../data/demoData';
import type { Difficulty, Question, QuestionType, QuestionStatus } from '../../types';
import { uid } from '../../lib/utils';
import { QuestionCard, QuestionForm, QuestionPreviewModal, emptyQuestionForm, questionToFormValues } from './QuestionComponents';

type SortKey = 'newest' | 'oldest' | 'points' | 'usage' | 'az';

export function QuestionBankPage() {
  const { questions, addQuestion, updateQuestion, removeQuestion, removeQuestions, collections, updateCollection, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [tab, setTab] = useState('active');

  const [selected, setSelected] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [addToCollectionTarget, setAddToCollectionTarget] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debounced = useDebounced(query, 200);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialQuery = params.get('q');
    if (params.get('new') === '1') {
      navigate('/questions', { replace: true });
      setCreateOpen(true);
    }
    if (initialQuery) setQuery(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const list = questions.filter((question) => {
      if (tab === 'active' && question.status !== 'active') return false;
      if (tab === 'archived' && question.status !== 'archived') return false;
      if (tab === 'drafts' && question.status !== 'draft') return false;
      if (subjectFilter && question.subjectId !== subjectFilter) return false;
      if (topicFilter && question.topicId !== topicFilter) return false;
      if (difficulty && question.difficulty !== difficulty) return false;
      if (typeFilter && question.type !== typeFilter) return false;
      if (status && question.status !== status) return false;
      if (q) {
        const haystack = [question.text, question.tags.join(' '), question.author, topicName(question.topicId)].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      switch (sort) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'points': return b.points - a.points;
        case 'usage': return b.usageCount - a.usageCount;
        case 'az': return a.text.localeCompare(b.text);
        default: return 0;
      }
    });
    return list;
  }, [questions, debounced, tab, subjectFilter, topicFilter, difficulty, typeFilter, status, sort]);

  const topicOptions = subjectFilter ? topicsForSubject(subjectFilter) : TOPICS;

  const preview = questions.find((q) => q.id === previewId);
  const editing = questions.find((q) => q.id === editId);

  const handleCreate = (q: Question) => {
    addQuestion(q);
    toast('success', 'Question created', 'Added to the question bank.');
    setCreateOpen(false);
  };

  const handleEdit = (id: string, q: Question) => {
    updateQuestion(id, q);
    toast('success', 'Question updated');
    setEditId(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    removeQuestion(deleteId);
    toast('success', 'Question deleted');
  };

  const handleBulkDelete = () => {
    removeQuestions(selected);
    toast('success', `${selected.length} questions deleted`);
    setSelected([]);
  };

  const handleBulkArchive = () => {
    selected.forEach((id) => updateQuestion(id, { status: 'archived' }));
    toast('success', `${selected.length} questions archived`);
    setSelected([]);
  };

  const handleAddToCollection = () => {
    if (!addToCollectionTarget || !collectionId) return;
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    updateCollection(col.id, { questionIds: [...new Set([...col.questionIds, addToCollectionTarget])] });
    toast('success', `Added to "${col.name}"`);
    setAddToCollectionTarget(null);
    setCollectionId(null);
  };

  const duplicate = (q: Question) => {
    const copy: Question = { ...q, id: uid('q'), text: `${q.text} (copy)`, usageCount: 0, createdAt: Date.now(), updatedAt: Date.now(), author: 'Demo Teacher' };
    addQuestion(copy);
    toast('success', 'Question duplicated');
  };

  const toggleStatus = (q: Question) => {
    updateQuestion(q.id, { status: q.status === 'active' ? 'archived' : 'active' });
    toast('info', q.status === 'active' ? 'Question archived' : 'Question restored');
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const counts = useMemo(
    () => ({
      active: questions.filter((q) => q.status === 'active').length,
      archived: questions.filter((q) => q.status === 'archived').length,
      drafts: questions.filter((q) => q.status === 'draft').length,
    }),
    [questions]
  );

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Question Bank</h1>
          <p className="text-sm text-muted">{questions.length} questions across {SUBJECTS.length} subjects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon="upload" onClick={() => navigate('/questions/import')}>Import</Button>
          <Button icon="plus" onClick={() => setCreateOpen(true)}>New Question</Button>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="Search questions, tags, topics…" className="flex-1" />
            <div className="flex gap-2">
              <Button variant={showFilters ? 'primary' : 'secondary'} icon="filter" size="sm" onClick={() => setShowFilters((v) => !v)}>
                Filters
              </Button>
              <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="sm:w-40">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="points">Points</option>
                <option value="usage">Most used</option>
                <option value="az">A–Z</option>
              </Select>
            </div>
          </div>

          {showFilters ? (
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 md:grid-cols-5">
              <Select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setTopicFilter(''); }}>
                <option value="">All subjects</option>
                {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
                <option value="">All topics</option>
                {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}>
                <option value="">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as QuestionType | '')}>
                <option value="">All types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="multiple_select">Multiple Select</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
                <option value="fill_blank">Fill in the Blank</option>
                <option value="essay">Essay</option>
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value as QuestionStatus | '')}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
          ) : null}

          {selected.length > 0 ? (
            <div className="flex items-center justify-between rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2">
              <span className="text-sm font-medium text-brand-500">{selected.length} selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon="archive" onClick={handleBulkArchive}>Archive</Button>
                <Button variant="outline" size="sm" icon="folder" onClick={() => setAddToCollectionTarget(selected[0])}>Add to collection</Button>
                <Button variant="danger" size="sm" icon="trash" onClick={handleBulkDelete}>Delete</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="mb-4">
        <Tabs
          tabs={[
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'drafts', label: 'Drafts', count: counts.drafts },
            { id: 'archived', label: 'Archived', count: counts.archived },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="search"
            title="No questions match your filters"
            description="Try adjusting the search or filters, or create a new question."
            action={<Button icon="plus" size="sm" onClick={() => setCreateOpen(true)}>New Question</Button>}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.slice(0, 40).map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              selected={selected.includes(q.id)}
              onSelect={() => toggleSelect(q.id)}
              onPreview={() => setPreviewId(q.id)}
              onEdit={() => setEditId(q.id)}
              onDelete={() => setDeleteId(q.id)}
              onToggleStatus={() => toggleStatus(q)}
              onAddToCollection={() => setAddToCollectionTarget(q.id)}
              onDuplicate={() => duplicate(q)}
            />
          ))}
          {filtered.length > 40 ? (
            <p className="py-3 text-center text-sm text-soft">Showing 40 of {filtered.length} results. Refine your search to see more.</p>
          ) : null}
        </div>
      )}

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Question" subtitle="Add a question to the bank" icon="plus" size="lg">
        <QuestionForm initial={emptyQuestionForm()} onSubmit={(v) => {
          const q: Question = {
            id: uid('q'),
            type: v.type,
            text: v.text.trim(),
            options: v.options.filter((o) => o.text.trim()).map((o) => ({ id: o.id, text: o.text.trim() })),
            correctAnswer: v.type === 'short_answer' || v.type === 'fill_blank'
              ? v.acceptedAnswers.filter((a) => a.trim())
              : v.options.filter((o) => o.correct).map((o) => o.id),
            explanation: v.explanation.trim() || undefined,
            subjectId: v.subjectId,
            topicId: v.topicId,
            difficulty: v.difficulty,
            tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
            points: v.points,
            estimatedSeconds: v.estimatedSeconds,
            author: 'Demo Teacher',
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            usageCount: 0,
          };
          handleCreate(q);
        }} onCancel={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit */}
      {editing ? (
        <Modal open onClose={() => setEditId(null)} title="Edit Question" icon="pencil" size="lg">
          <QuestionForm
            initial={questionToFormValues(editing)}
            onSubmit={(v) => {
              handleEdit(editing.id, {
                ...editing,
                type: v.type,
                text: v.text.trim(),
                options: v.options.filter((o) => o.text.trim()).map((o) => ({ id: o.id, text: o.text.trim() })),
                correctAnswer: v.type === 'short_answer' || v.type === 'fill_blank'
                  ? v.acceptedAnswers.filter((a) => a.trim())
                  : v.options.filter((o) => o.correct).map((o) => o.id),
                explanation: v.explanation.trim() || undefined,
                subjectId: v.subjectId,
                topicId: v.topicId,
                difficulty: v.difficulty,
                tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
                points: v.points,
                estimatedSeconds: v.estimatedSeconds,
              });
            }}
            onCancel={() => setEditId(null)}
            submitLabel="Save Changes"
          />
        </Modal>
      ) : null}

      {/* Preview */}
      {preview ? <QuestionPreviewModal question={preview} onClose={() => setPreviewId(null)} /> : null}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete question?"
        message="This will permanently remove the question from the bank. Quizzes that reference it will skip it."
      />

      {/* Add to collection */}
      <Modal open={addToCollectionTarget !== null} onClose={() => { setAddToCollectionTarget(null); setCollectionId(null); }} title="Add to Collection" size="sm">
        <div className="flex flex-col gap-4">
          <Select value={collectionId ?? ''} onChange={(e) => setCollectionId(e.target.value)}>
            <option value="" disabled>Select a collection…</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Button icon="folder" onClick={handleAddToCollection}>Add to collection</Button>
        </div>
      </Modal>
    </div>
  );
}