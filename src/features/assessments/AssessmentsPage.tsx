import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { AssessmentKind } from '../../types';
import { Button, Card, ConfirmDialog, EmptyState, SearchInput, Tabs } from '../../components/ui';
import { AssessmentCard } from './AssessmentComponents';

export function AssessmentsPage({ kind }: { kind: AssessmentKind }) {
  const { assessments, questions, updateAssessment, removeAssessment, toast, profile } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assessments.filter((a) => {
      if (a.kind !== kind) return false;
      if (tab === 'published' && a.status !== 'published') return false;
      if (tab === 'draft' && a.status !== 'draft') return false;
      if (tab === 'closed' && a.status !== 'closed') return false;
      if (q && !a.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [assessments, kind, query, tab]);

  const counts = useMemo(
    () => ({
      all: assessments.filter((a) => a.kind === kind).length,
      published: assessments.filter((a) => a.kind === kind && a.status === 'published').length,
      draft: assessments.filter((a) => a.kind === kind && a.status === 'draft').length,
      closed: assessments.filter((a) => a.kind === kind && a.status === 'closed').length,
    }),
    [assessments, kind]
  );

  const qCount = (id: string) => questions.filter((q) => q.id === id).length;

  const handleDelete = () => {
    if (!deleteId) return;
    removeAssessment(deleteId);
    toast('success', `${kind === 'quiz' ? 'Quiz' : 'Exam'} deleted`);
  };

  const toggleStatus = (id: string) => {
    const a = assessments.find((x) => x.id === id);
    if (!a) return;
    const next = a.status === 'published' ? 'draft' : 'published';
    updateAssessment(id, { status: next });
    toast('success', next === 'published' ? 'Published' : 'Unpublished');
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text capitalize">{kind}s</h1>
          <p className="text-sm text-muted">
            {profile.role === 'student'
              ? 'Your available and completed assessments'
              : `Manage and publish ${kind}s for your students`}
          </p>
        </div>
        <Button icon="plus" onClick={() => navigate(`/${kind}s/new`)}>New {kind}</Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder={`Search ${kind}s…`} className="flex-1" />
      </div>

      <Tabs
        className="mb-4"
        tabs={[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'published', label: 'Published', count: counts.published },
          { id: 'draft', label: 'Drafts', count: counts.draft },
          { id: 'closed', label: 'Closed', count: counts.closed },
        ]}
        active={tab}
        onChange={setTab}
      />

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon="quiz"
            title={`No ${kind}s here`}
            description={`Create your first ${kind} to get started.`}
            action={<Button icon="plus" size="sm" onClick={() => navigate(`/${kind}s/new`)}>New {kind}</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((a) => (
            <AssessmentCard
              key={a.id}
              assessment={a}
              questionCount={qCount(a.id)}
              onOpen={() => navigate(`/${kind}s/${a.id}`)}
              onEdit={() => navigate(`/${kind}s/${a.id}/edit`)}
              onToggleStatus={() => toggleStatus(a.id)}
              onDelete={() => setDeleteId(a.id)}
              onTake={profile.role === 'student' ? () => navigate(`/take/${a.id}`) : undefined}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={`Delete ${kind}?`}
        message="This permanently removes the assessment and its configuration."
      />
    </div>
  );
}