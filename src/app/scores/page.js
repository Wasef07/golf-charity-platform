"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserScores,
  addScore,
  updateScore,
  deleteScore,
} from "@/lib/scores";

export default function ScoresPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    score: "",
    playedAt: new Date().toISOString().split("T")[0],
  });

  // Edit form state
  const [editData, setEditData] = useState({
    score: "",
    playedAt: "",
  });

  useEffect(() => {
    if (user) fetchScores();
  }, [user]);

  async function fetchScores() {
    setLoading(true);
    const { data, error } = await getUserScores(user.id);
    if (!error) setScores(data || []);
    setLoading(false);
  }

  async function handleAddScore(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate score range
    const scoreNum = parseInt(formData.score);
    if (scoreNum < 1 || scoreNum > 45) {
      setError("Score must be between 1 and 45 (Stableford format)");
      return;
    }

    // Validate date not in future
    const today = new Date().toISOString().split("T")[0];
    if (formData.playedAt > today) {
      setError("Score date cannot be in the future");
      return;
    }

    setSubmitting(true);

    const { error } = await addScore(
      user.id,
      formData.score,
      formData.playedAt,
    );

    if (error) {
      setError("Failed to save score. Please try again.");
    } else {
      setSuccess(
        scores.length >= 5
          ? "Score added! Your oldest score was removed."
          : "Score added successfully!",
      );
      setFormData({
        score: "",
        playedAt: new Date().toISOString().split("T")[0],
      });
      fetchScores();
    }

    setSubmitting(false);
  }

  async function handleEditStart(scoreItem) {
    setEditingId(scoreItem.id);
    setEditData({
      score: scoreItem.score,
      playedAt: scoreItem.played_at,
    });
  }

  async function handleEditSave(scoreId) {
    setError("");

    const scoreNum = parseInt(editData.score);
    if (scoreNum < 1 || scoreNum > 45) {
      setError("Score must be between 1 and 45");
      return;
    }

    if (!editData.playedAt) {
      setError("Please select a date");
      return;
    }

    const { data, error } = await updateScore(
      scoreId,
      editData.score,
      editData.playedAt,
    );

    if (error) {
      console.error("Edit save error:", error);
      setError("Failed to update score: " + error.message);
    } else {
      setSuccess("Score updated!");
      setEditingId(null);
      fetchScores();
    }
  }

  async function handleDelete(scoreId) {
    if (!confirm("Are you sure you want to delete this score?")) return;

    const { error } = await deleteScore(scoreId);
    if (!error) {
      setSuccess("Score deleted.");
      fetchScores();
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getScoreColor(score) {
    if (score >= 36) return "text-green-400";
    if (score >= 25) return "text-yellow-400";
    return "text-red-400";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Scores</h1>
        <a
          href="/dashboard"
          className="text-gray-400 hover:text-white text-sm transition"
        >
          ← Back to Dashboard
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Info Banner */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
          <span className="text-blue-400 text-xl">ℹ</span>
          <div>
            <p className="text-sm text-gray-300">
              Enter your last{" "}
              <strong className="text-white">5 Stableford scores</strong> (1–45
              points each). Adding a new score when you already have 5 will
              automatically remove your oldest score.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Add Score Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-5">Add New Score</h2>
          <form onSubmit={handleAddScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Stableford Score
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: e.target.value })
                  }
                  required
                  placeholder="e.g. 32"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition"
                />
                <p className="text-xs text-gray-600 mt-1">Range: 1 – 45</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Date Played
                </label>
                <input
                  type="date"
                  value={formData.playedAt}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, playedAt: e.target.value })
                  }
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition"
            >
              {submitting
                ? "Saving..."
                : `Add Score ${scores.length >= 5 ? "(Replaces Oldest)" : `(${scores.length}/5)`}`}
            </button>
          </form>
        </div>

        {/* Scores List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Your Last 5 Scores</h2>
            <span className="text-sm text-gray-400">
              {scores.length}/5 scores
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading scores...
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-4xl mb-3">🏌️</p>
              <p className="text-gray-400">
                No scores yet. Add your first score above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((scoreItem, index) => (
                <div
                  key={scoreItem.id}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                >
                  {editingId === scoreItem.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">
                            Score
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="45"
                            value={editData.score}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                score: e.target.value,
                              })
                            }
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editData.playedAt}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                playedAt: e.target.value,
                              })
                            }
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSave(scoreItem.id)}
                          className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg text-sm transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <span
                            className={`text-3xl font-bold ${getScoreColor(scoreItem.score)}`}
                          >
                            {scoreItem.score}
                          </span>
                          <p className="text-xs text-gray-500">pts</p>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {formatDate(scoreItem.played_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {index === 0
                              ? "🟢 Latest"
                              : index === scores.length - 1 &&
                                  scores.length === 5
                                ? "🔴 Oldest"
                                : `#${index + 1}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStart(scoreItem)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(scoreItem.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Score Progress Bar */}
          {scores.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Score slots used</span>
                <span>{scores.length}/5</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(scores.length / 5) * 100}%` }}
                />
              </div>
              {scores.length === 5 && (
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠ All 5 slots full — next score will replace your oldest
                </p>
              )}
            </div>
          )}
        </div>

        {/* Average Score Card */}
        {scores.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-400">
                  {Math.round(
                    scores.reduce((a, b) => a + b.score, 0) / scores.length,
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Average</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-blue-400">
                  {Math.max(...scores.map((s) => s.score))}
                </p>
                <p className="text-xs text-gray-500 mt-1">Best</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-3xl font-bold text-yellow-400">
                  {Math.min(...scores.map((s) => s.score))}
                </p>
                <p className="text-xs text-gray-500 mt-1">Lowest</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
