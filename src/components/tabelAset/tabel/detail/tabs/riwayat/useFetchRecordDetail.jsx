export const useFetchRecordDetail = () => {
  const fetchRecordDetail = async (tabelRef, recordId) => {
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

      if (!res.ok) {
        console.warn(`Failed to fetch ${tabelRef}/${recordId}: ${res.status}`);
        return null;
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`Error fetching ${tabelRef}/${recordId}:`, err);
      return null;
    }
  };

  return fetchRecordDetail;
};
