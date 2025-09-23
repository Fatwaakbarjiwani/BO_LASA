import { useState, useEffect, useCallback } from "react";
import { OrbitProgress } from "react-loading-indicators";

export default function TableSettingPenerima() {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    id: 1,
    jumlahPenerimaManfaat: 0,
    penerimaManfaatCampaign: 0,
    penerimaManfaatZakat: 0,
    penerimaManfaatInfak: 0,
    penerimaManfaatWakaf: 0,
    penerimaManfaatDSKL: 0,
  });
  const [formData, setFormData] = useState({
    jumlahPenerimaManfaat: 0,
    penerimaManfaatCampaign: 0,
    penerimaManfaatZakat: 0,
    penerimaManfaatInfak: 0,
    penerimaManfaatWakaf: 0,
    penerimaManfaatDSKL: 0,
  });

  const baseUrl = import.meta.env.VITE_API_URL;

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/penerima-manfaat/get/one`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setFormData(result);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Edit data via API
  const editData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/penerima-manfaat/edit/1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        setEdit(false);
        alert("Data berhasil diperbarui");
      } else {
        console.error("Failed to update data");
        alert("Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Terjadi kesalahan saat memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editData();
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg border border-gray-100 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Setting Penerima Manfaat
        </h1>

        {/* Tombol Ubah */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setEdit(!edit)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 focus:outline-none"
            disabled={loading}
          >
            {edit ? "Batal" : "Ubah Data"}
          </button>
        </div>

        {/* Konten */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center py-8">
              <OrbitProgress
                variant="track-disc"
                color="#3B82F6"
                size="medium"
                text="Loading..."
                textColor="#6B7280"
              />
            </div>
          ) : !edit ? (
            <div className="text-center">
              <p className="text-gray-700 text-sm mb-4">
                Data Penerima Manfaat Distribusi
              </p>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        Total Penerima Manfaat
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {data.jumlahPenerimaManfaat}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">
                        Penerima Manfaat Zakat
                      </h3>
                      <p className="text-xl font-bold text-green-600">
                        {data.penerimaManfaatZakat}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-2">
                        Penerima Manfaat Infak
                      </h3>
                      <p className="text-xl font-bold text-purple-600">
                        {data.penerimaManfaatInfak}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-2">
                        Penerima Manfaat Campaign
                      </h3>
                      <p className="text-xl font-bold text-orange-600">
                        {data.penerimaManfaatCampaign}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">
                        Penerima Manfaat Wakaf
                      </h3>
                      <p className="text-xl font-bold text-red-600">
                        {data.penerimaManfaatWakaf}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-indigo-800 mb-2">
                        Penerima Manfaat DSKL
                      </h3>
                      <p className="text-xl font-bold text-indigo-600">
                        {data.penerimaManfaatDSKL}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Form Edit Data Penerima Manfaat
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Penerima Manfaat
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.jumlahPenerimaManfaat}
                      onChange={(e) =>
                        handleInputChange(
                          "jumlahPenerimaManfaat",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penerima Manfaat Zakat
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.penerimaManfaatZakat}
                      onChange={(e) =>
                        handleInputChange(
                          "penerimaManfaatZakat",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penerima Manfaat Infak
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.penerimaManfaatInfak}
                      onChange={(e) =>
                        handleInputChange(
                          "penerimaManfaatInfak",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penerima Manfaat Campaign
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.penerimaManfaatCampaign}
                      onChange={(e) =>
                        handleInputChange(
                          "penerimaManfaatCampaign",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penerima Manfaat Wakaf
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.penerimaManfaatWakaf}
                      onChange={(e) =>
                        handleInputChange(
                          "penerimaManfaatWakaf",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penerima Manfaat DSKL
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.penerimaManfaatDSKL}
                      onChange={(e) =>
                        handleInputChange("penerimaManfaatDSKL", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 focus:outline-none disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdit(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 focus:outline-none"
                    disabled={loading}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
