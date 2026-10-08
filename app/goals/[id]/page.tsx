'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Clock3, Sparkles, Target } from 'lucide-react'
import { useLifePilot, goalProgress } from '@/lib/lifepilot-store'
import type { Task } from '@/lib/types'

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const {
    goals,
    toggleTask,
    replanGoal,
    isThinking,
  } = useLifePilot()

  const goal = goals.find((g) => g.id === params.id)

  const [selected, setSelected] = useState<Task | null>(null)
  const [reason, setReason] = useState('')
  const [showReplan, setShowReplan] = useState(false)
  const [error, setError] = useState('')

  if (!goal) {
    return (
      <main className="container">
        <button
          onClick={() => router.push('/goals')}
          className="btn"
        >
          ← Back to goals
        </button>

        <div className="card" style={{ marginTop: 18 }}>
          <h2 className="h2">Goal not found</h2>
          <p className="muted">
            This goal may have been removed or is no longer available.
          </p>
        </div>
      </main>
    )
  }

  const progress = goalProgress(goal)

  const runReplan = async () => {
    if (!reason.trim()) return

    setError('')

    try {
      await replanGoal(goal.id, reason.trim())
      setReason('')
      setShowReplan(false)
      setSelected(null)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not replan the goal.',
      )
    }
  }

  const completedTasks = goal.tasks.filter(
    (task) => task.done,
  ).length

  return (
    <main className="container goal-detail">
      {/* Back */}
      <button
        onClick={() => router.push('/goals')}
        className="btn"
      >
        ← Back to goals
      </button>

      {/* Hero */}
      <section className="goal-hero card">
        <div className="goal-hero-main">
          <div>
            <div className="eyebrow">LifePilot plan</div>

            <h1 className="goal-title">
              {goal.title}
            </h1>

            <p className="goal-description">
              {goal.description}
            </p>

            <div className="goal-meta">
              <span className="tag">
                {goal.category}
              </span>

              <span className="muted small">
                {completedTasks} of {goal.tasks.length} tasks completed
              </span>
            </div>
          </div>

          <div className="goal-progress-box">
            <div className="goal-progress-number">
              {progress}%
            </div>

            <div className="muted small">
              complete
            </div>
          </div>
        </div>

        <div className="progress goal-progress-bar">
          <div
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      {/* Outcomes + milestones */}
      {(goal.outcomes.length > 0 ||
        goal.milestones.length > 0) && (
        <section className="grid grid2">
          {goal.outcomes.length > 0 && (
            <div className="card plan-card">
              <div className="plan-card-heading">
                <span className="plan-icon">
                  <Target size={18} />
                </span>

                <div>
                  <h2 className="h2">Outcomes</h2>
                  <p className="muted small">
                    What success looks like
                  </p>
                </div>
              </div>

              <div className="plan-list">
                {goal.outcomes.map((item, index) => (
                  <div
                    key={index}
                    className="plan-item"
                  >
                    <span className="plan-number">
                      {index + 1}
                    </span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {goal.milestones.length > 0 && (
            <div className="card plan-card">
              <div className="plan-card-heading">
                <span className="plan-icon">
                  <Sparkles size={18} />
                </span>

                <div>
                  <h2 className="h2">Milestones</h2>
                  <p className="muted small">
                    Major stages of the plan
                  </p>
                </div>
              </div>

              <div className="plan-list">
                {goal.milestones.map((item, index) => (
                  <div
                    key={index}
                    className="plan-item"
                  >
                    <span className="plan-number">
                      {index + 1}
                    </span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tasks */}
      <section className="card">
        <div className="section-header">
          <div>
            <h2 className="h2">Your tasks</h2>

            <p className="muted small">
              Complete each task to move your goal forward.
            </p>
          </div>

          <button
            onClick={() =>
              setShowReplan((value) => !value)
            }
            className="btn"
          >
            {showReplan ? 'Close' : 'Adjust plan'}
          </button>
        </div>

        {/* Replan */}
        {showReplan && (
          <div className="replan-box">
            <div className="eyebrow">
              AI replanning
            </div>

            <h3 className="replan-title">
              What changed?
            </h3>

            <p className="muted small">
              Tell LifePilot what changed and it will
              adjust the plan around your new situation.
            </p>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              rows={3}
              placeholder="Example: I only have 20 minutes available this week."
              className="textarea replan-input"
            />

            <div className="row">
              <button
                disabled={
                  isThinking || !reason.trim()
                }
                onClick={runReplan}
                className="btn primary"
              >
                {isThinking
                  ? 'Replanning…'
                  : 'Replan with AI'}
              </button>

              {error && (
                <span className="alert">
                  {error}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="task-list">
          {goal.tasks.map((task) => (
            <div
              key={task.id}
              className={`goal-task ${
                task.done ? 'goal-task-done' : ''
              }`}
              onClick={() => setSelected(task)}
            >
              <button
                type="button"
                className={`task-check ${
                  task.done
                    ? 'task-check-done'
                    : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  void toggleTask(
                    goal.id,
                    task.id,
                  )
                }}
                aria-label={
                  task.done
                    ? 'Mark task incomplete'
                    : 'Mark task complete'
                }
              >
                {task.done && <Check size={16} />}
              </button>

              <div className="goal-task-content">
                <div
                  className={`goal-task-title ${
                    task.done
                      ? 'goal-task-title-done'
                      : ''
                  }`}
                >
                  {task.title}
                </div>

                <div className="goal-task-meta">
                  <span>{task.due}</span>

                  <span className="task-time">
                    <Clock3 size={13} />
                    {task.duration}
                  </span>

                  {task.adjusted && (
                    <span className="adjusted-tag">
                      Adjusted by AI
                    </span>
                  )}
                </div>
              </div>

              <span className="task-view">
                View →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Task details modal */}
      {selected && (
        <div
          className="modal"
          onClick={() => setSelected(null)}
        >
          <div
            className="modalbox task-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="row between task-modal-header">
              <div>
                <div className="eyebrow">
                  Task details
                </div>

                <h2 className="h2 task-modal-title">
                  {selected.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelected(null)
                }
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="grid grid2 task-info-grid">
              <div className="info-box">
                <div className="info-label">
                  Due
                </div>

                <div className="info-value">
                  {selected.due}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">
                  Estimated time
                </div>

                <div className="info-value">
                  {selected.duration}
                </div>
              </div>
            </div>

            {selected.purpose && (
              <div className="detail-section">
                <h3>Why this matters</h3>

                <p className="muted">
                  {selected.purpose}
                </p>
              </div>
            )}

            {selected.steps &&
              selected.steps.length > 0 && (
                <div className="detail-section">
                  <h3>What to do</h3>

                  <div className="steps-list">
                    {selected.steps.map(
                      (step, index) => (
                        <div
                          key={index}
                          className="step-item"
                        >
                          <span className="step-number">
                            {index + 1}
                          </span>

                          <span>{step}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {selected.result && (
              <div className="detail-section">
                <h3>Expected result</h3>

                <div className="result-box">
                  {selected.result}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                void toggleTask(
                  goal.id,
                  selected.id,
                )

                setSelected({
                  ...selected,
                  done: !selected.done,
                })
              }}
              className="btn primary complete-button"
            >
              {selected.done
                ? 'Mark incomplete'
                : 'Mark complete'}

              <Check size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}