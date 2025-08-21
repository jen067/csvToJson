import { useState, useEffect } from "react";
import { Sun, Moon, Upload, FileSpreadsheet, Paperclip } from "lucide-react";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const saveTheme = localStorage.getItem("theme");
    const syetemPreferDark = window.matchMedia(
      "(prefer-color-scheme:dark)"
    ).matches;

    if (saveTheme) {
      setTheme(saveTheme);
    } else if (syetemPreferDark) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <div
      className={`min-h-screen flex flex-col gap-6 items-center transition-colors duration-300 ${theme}`}
    >
      {/* Header */}
      <header className="w-full max-w-[18.75rem] md:max-w-[45rem] lg:max-w-[75rem] flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">
          Product Data Processing System
        </h1>
        <button
          onClick={toggleTheme}
          aria-label="switch-mood-btn"
          className={`rounded-full p-2 border-[1.5px] transition-all duration-300 ${
            theme === "light" ? "border-gray-600" : "border-gray-200"
          }`}
        >
          {theme === "light" ? (
            <Sun className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <Moon className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </header>
      {/* Main */}
      <main className="w-full max-w-[18.75rem] md:max-w-[45rem] lg:max-w-[75rem] flex flex-col gap-6 bg-gray-200/50 dark:bg-gray-500/50 px-4 md:px-8 py-6 rounded-lg">
        {/* 資料上傳 */}
        <section id="data_upload" className="flex flex-col gap-4">
          {/* 標題 */}
          <header className="flex gap-3 items-center">
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
              Data Upload
            </h2>
          </header>
          {/* 資料上傳區域 */}
          <fieldset className="flex flex-col gap-3">
            <label className="text-sm md:text-lg font-medium text-gray-700 dark:text-gray-200 ">
              Data File (CSV/JSON/TXT)
            </label>
            <input type="file" accept=".csv,.json.txt" className="hidden" />
            <div
              className={`w-full px-2 py-6 rounded-md flex flex-col gap-2 items-center cursor-pointer bg-white/50 dark:bg-gray-600/50 border-2 border-dashed border-gray-500/50 dark:border-gray-200/50 overflow-hidden mb-4`}
            >
              <FileSpreadsheet className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50 dark:opacity-80" />
              <span className="text-gray-700 dark:text-gray-200 text-sm md:text-base">
                {uploadedFile
                  ? `${uploadedFile.name}`
                  : "點擊選擇資料檔案 (CSV/JSON)"}
              </span>
            </div>
            <button className="w-full py-6 px-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 hover:text-gray-200 transition-all duration-300 text-sm md:text-lg font-medium">
              開始轉換
            </button>
          </fieldset>
        </section>
      </main>
    </div>
  );
}

export default App;
