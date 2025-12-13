export const useFetchRecordDetail = () => {
  const fetchRecordDetail = async (tabelRef, recordId, item = null) => {
    try {
      // Get auth headers from localStorage
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};
      const headers = {
        "Content-Type": "application/json",
      };

      if (user?.token) headers.Authorization = `Bearer ${user.token}`;
      if (user?.role) headers["x-role"] = String(user.role);
      if (user?.username) headers["x-username"] = String(user.username);

      const endpoint = `/${tabelRef}/${recordId}`;
      const res = await fetch(endpoint, {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }

      // Fallbacks for aset: sometimes the record_id is numeric but the API
      // resource is identified by composite AsetId string. Try querying by
      // AsetId if the direct fetch returned 404 and we have item info.
      if (tabelRef === "aset" && (res.status === 404 || res.status === 400)) {
        // Try to extract possible AsetId from the provided item
        const possibleAsetId =
          (item && (item.asetIdString || item.AsetId || item.asetId)) ||
          recordId;

        if (possibleAsetId) {
          const q = encodeURIComponent(possibleAsetId);
          const ep = `/aset?AsetId=${q}`;
          try {
            const r2 = await fetch(ep, { credentials: "include", headers });
            if (r2.ok) {
              const d2 = await r2.json();
              // Normalize array responses: try to find matching record by id or AsetId
              if (Array.isArray(d2)) {
                let match = null;
                if (item) {
                  match = d2.find(
                    (x) =>
                      String(x.id) ===
                        String(item.recordId || item.record_id) ||
                      String(x.AsetId) ===
                        String(item.asetIdString || item.AsetId || item.asetId)
                  );
                }
                if (!match && d2.length === 1) match = d2[0];
                return match || null;
              }
              return d2;
            }
          } catch (err2) {}
        }
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  return fetchRecordDetail;
};
