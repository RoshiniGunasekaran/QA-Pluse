import React, { useEffect, useState } from "react";

interface Organization {
  id: number;
  name: string;
}

interface OrgSelectorProps {
  onOrgChange?: (orgId: number) => void;
}

const OrgSelector: React.FC<OrgSelectorProps> = ({
  onOrgChange,
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/orgs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load organizations"
          );
        }

        const orgs: Organization[] = data.data;

        setOrganizations(orgs);

        // Restore previously selected organization
        const savedOrgId = localStorage.getItem(
          "selectedOrgId"
        );

        const savedOrg = savedOrgId
          ? orgs.find(
              (org) => org.id === Number(savedOrgId)
            )
          : undefined;

        if (savedOrg) {
          setSelectedOrgId(savedOrg.id);
          onOrgChange?.(savedOrg.id);
        } else if (orgs.length > 0) {
          const firstOrg = orgs[0];

          setSelectedOrgId(firstOrg.id);

          localStorage.setItem(
            "selectedOrgId",
            String(firstOrg.id)
          );

          onOrgChange?.(firstOrg.id);
        }
      } catch (err: any) {
        console.error("Failed to fetch organizations:", err);
        setError(
          err.message || "Failed to load organizations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [token, onOrgChange]);

  // Change organization
  const handleOrgChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const orgId = Number(event.target.value);

    setSelectedOrgId(orgId);

    localStorage.setItem(
      "selectedOrgId",
      String(orgId)
    );

    onOrgChange?.(orgId);
  };

  // Create organization
  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/orgs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: orgName.trim(),
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to create organization"
        );
      }

      const newOrganization: Organization = data.data;

      // Add new organization to dropdown
      setOrganizations((prev) => [
        ...prev,
        newOrganization,
      ]);

      // Select newly created organization
      setSelectedOrgId(newOrganization.id);

      localStorage.setItem(
        "selectedOrgId",
        String(newOrganization.id)
      );

      // Notify parent/dashboard
      onOrgChange?.(newOrganization.id);

      // Reset modal
      setOrgName("");
      setShowModal(false);
    } catch (err: any) {
      console.error("Create organization error:", err);

      setError(
        err.message || "Failed to create organization"
      );
    } finally {
      setCreating(false);
    }
  };

  const currentOrganization = organizations.find(
    (org) => org.id === selectedOrgId
  );

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Loading organizations...
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <select
          value={selectedOrgId ?? ""}
          onChange={handleOrgChange}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {organizations.length === 0 && (
            <option value="">
              No organizations
            </option>
          )}

          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setError("");
            setOrgName("");
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          + New Organization
        </button>
      </div>

      {/* Create Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create New Organization
            </h2>

            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Organization name"
              disabled={creating}
              autoFocus
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <div className="mt-3 bg-red-900/30 border border-red-700 text-red-400 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowModal(false);
                  setOrgName("");
                  setError("");
                }}
                disabled={creating}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateOrganization}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg"
              >
                {creating
                  ? "Creating..."
                  : "Create Organization"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrgSelector;