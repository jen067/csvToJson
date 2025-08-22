import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Upload,
  FileSpreadsheet,
  TextSearch,
  File,
} from "lucide-react";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isRippleActive, setRippleActive] = useState(false);

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
        <h1 className="text-xl md:text-2xl font-bold">資料轉換處理器</h1>
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setRippleActive(true)}
          onMouseLeave={() => setRippleActive(false)}
          aria-label="switch-mood-btn"
          className={`relative overflow-hidden rounded-full p-2 border-[1.5px] transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 ${
            theme === "light" ? "border-gray-500" : "border-gray-200"
          }`}
        >
          <div
            className={`absolute -z-10 w-0 h-0 rounded-full bg-gray-500 dark:bg-gray-700 transition-all duration-300 ease-out ${
              isRippleActive
                ? "w-28 h-28 -bottom-14 -left-14"
                : "w-0 h-0 bottom-0 left-0"
            }`}
            style={{
              transform: isRippleActive ? "scale(1)" : "scale(0)",
              transformOrigin: "bottom left",
            }}
          />
          <span>
            {theme === "light" ? (
              <Sun
                className={`w-5 h-5 md:w-6 md:h-6 ${
                  isRippleActive ? "stroke-gray-200" : "stroke-gray-800"
                }`}
              />
            ) : (
              <Moon className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </span>
        </button>
      </header>
      {/* Main */}
      <main className="w-full max-w-[18.75rem] md:max-w-[45rem] lg:max-w-[75rem] flex flex-col gap-12 bg-gray-200/50 dark:bg-gray-500/50 px-4 py-6 md:px-8 lg:px-12 lg:py-8 rounded-lg">
        {/* 資料上傳 */}
        <section id="data_upload" className="flex flex-col gap-4">
          {/* 標題 */}
          <header className="flex gap-3 items-center">
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
              上傳資料
            </h2>
          </header>
          {/* 資料上傳區域 */}
          <fieldset className="flex flex-col gap-3">
            <label className="text-sm md:text-base lg:text-lg font-medium text-gray-700 dark:text-gray-200">
              資料檔案 (CSV/JSON/TXT)
            </label>
            <input type="file" accept=".csv,.json.txt" className="hidden" />
            <div
              className={`w-full px-2 py-6 rounded-md flex flex-col gap-4 items-center cursor-pointer bg-white/50 dark:bg-gray-700/50 border-2 border-dashed border-gray-500/50 dark:border-gray-200/50 overflow-hidden mb-4`}
            >
              <FileSpreadsheet className="w-10 h-10 md:w-12 md:h-12 mx-auto opacity-50 dark:opacity-80" />
              <span className="text-gray-700 dark:text-gray-200 text-sm md:text-base">
                {uploadedFile
                  ? `${uploadedFile.name}`
                  : "點擊選擇資料檔案 (CSV/JSON)"}
              </span>
            </div>
            <button className="w-full py-5 px-2 rounded-md bg-gray-300 hover:text-gray-200 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800/80  transition-all duration-300 hover:shadow-xl text-sm md:text-lg font-medium">
              開始轉換
            </button>
          </fieldset>
        </section>
        {/* 資料預顯示區域 */}
        <section id="data_preview" className="flex flex-col gap-4">
          {/* 標題 */}
          <header className="flex gap-3 items-center">
            <File className="w-5 h-5 md:w-6 md:h-6" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
              處理結果
            </h2>
          </header>
          <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-700 rounded-md p-6 md:px-8 mb-4">
            {/* 標題 */}
            <header className="flex gap-3 items-center">
              <TextSearch className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                JSON 預覽
              </h3>
            </header>
            <div className="bg-gray-600 dark:bg-gray-800 rounded-lg p-4 py-6 max-h-80 overflow-y-auto">
              <pre className="text-sm text-green-400 dark:text-green-300 whitespace-pre-wrap">
                處理完成後，這裡會顯示生成的JSON資料
              </pre>
            </div>
          </div>
          <button className="w-full py-5 px-2 rounded-md bg-gray-300 hover:text-gray-200 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800/80  transition-all duration-300 hover:shadow-xl text-sm md:text-lg font-medium">
            下載 JSON 檔案
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
