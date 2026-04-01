"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCharity, updateUserCharity } from "@/lib/charities";
import { useAuth } from "@/context/AuthContext";

export default function CharityPage() {
  const { id } = useParams();
  const { user, profile, setProfile } = useAuth();
  const router = useRouter();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contribution, setContribution] = useState(10);
  const [success, setSuccess] = useState("");
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    fetchCharity();
  }, [id]);

  useEffect(() => {
    if (profile) {
      setIsSelected(profile.charity_id === id);
      if (profile.charity_id === id) {
        setContribution(profile.charity_contribution_percent || 10);
      }
    }
  }, [profile, id]);

  async function fetchCharity() {
    const { data } = await getCharity(id);
    setCharity(data);
    setLoading(false);
  }

  async function handleSelect() {
    if (!user) {
      router.push("/signup");
      return;
    }

    setSaving(true);
    const { data, error } = await updateUserCharity(user.id, id, contribution);

    if (!error) {
      setProfile(data);
      setIsSelected(true);
      setSuccess("Charity updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500">Charity not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back */}
      <div className="border-b border-gray-800 px-6 py-4">
        <a href="/charities" className="text-gray-400 hover:text-white text-sm">
          ← Back to Charities
        </a>
      </div>

      {/* Hero Image */}
      {charity.image_url && (
        <div className="h-64 overflow-hidden">
          <img
            src={charity.image_url}
            alt={charity.name}
            className="w-full h-full object-cover opacity-60"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Charity Info */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
              {charity.category}
            </span>
            {charity.is_featured && (
              <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">{charity.name}</h1>
          <p className="text-gray-300 leading-relaxed">{charity.description}</p>

          {charity.website_url && (
            <a
              href={charity.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-green-400 hover:text-green-300 text-sm"
            >
              Visit Website →
            </a>
          )}
        </div>

        {/* Select This Charity */}
        {user && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Support This Charity</h2>

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            {/* Contribution Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">
                  Your Contribution
                </label>
                <span className="text-2xl font-bold text-green-400">
                  {contribution}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={contribution}
                onChange={(e) => setContribution(parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>10% (minimum)</span>
                <span>50% (maximum)</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Based on $7.99/month, you'll contribute{" "}
                <span className="text-green-400 font-bold">
                  ${((7.99 * contribution) / 100).toFixed(2)}
                </span>{" "}
                per month to {charity.name}
              </p>
            </div>

            <button
              onClick={handleSelect}
              disabled={saving}
              className={`w-full font-bold py-3 rounded-lg transition ${
                isSelected
                  ? "bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30"
                  : "bg-green-500 hover:bg-green-400 text-black"
              }`}
            >
              {saving
                ? "Saving..."
                : isSelected
                  ? "✓ Currently Supporting — Update Contribution"
                  : "Select This Charity"}
            </button>
          </div>
        )}

        {!user && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <p className="text-gray-400 mb-4">
              Sign up to support this charity
            </p>
            <a
              href="/signup"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-lg transition inline-block"
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
