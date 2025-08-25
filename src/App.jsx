import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Upload,
  FileSpreadsheet,
  TextSearch,
  File,
  XCircle,
  CheckCircle,
} from "lucide-react";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");
  const [isRippleActive, setRippleActive] = useState(false);
  const filleInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [status, setStatus] = useState({ message: "", isError: false });
  const [processedData, setProcessedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 顏色縮寫
  const COLOR_CODE_MAP = {
    Black: "BLK",
    White: "WHT",
    Red: "RED",
    Orange: "ORA",
    Yellow: "YWL",
    Green: "GRN",
    Blue: "BLU",
    Purple: "PUR",
    Pink: "PNK",
    Gray: "GRY",
    Brown: "BRN",
  };

  // 資料保存
  useEffect(() => {
    const savedProcessedData = sessionStorage.getItem("processedData");
    const savedUploadedFileName = sessionStorage.getItem("uploadedFile");

    if (savedProcessedData) {
      try {
        setProcessedData(JSON.parse(savedProcessedData));
      } catch (error) {
        console.error("載入保存資料時發生錯誤:", error);
      }
    }

    if (savedUploadedFileName) {
      setUploadedFile({ name: savedUploadedFileName });
    }
  }, []);

  // 主題切換
  useEffect(() => {
    const saveTheme = sessionStorage.getItem("theme");
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
    sessionStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // 讀取檔案
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          if (file.name.toLowerCase().endsWith(".csv")) {
            const text = e.target.result;
            const line = text.split("\n");

            if (line.length < 2) {
              reject(new Error("CSV檔案必須包含標題行和至少一行資料"));
              return;
            }

            const header = line[0]
              .split(",")
              .map((h) => h.trim().replace(/"/g, ""));
            const data = [];

            for (let i = 1; i < line.length; i++) {
              if (line[i].trim()) {
                const value = line[i]
                  .split(",")
                  .map((v) => v.trim().replace(/"/g, ""));
                const row = {};
                header.forEach((header, index) => {
                  row[header] = value[index] || "";
                });
                data.push(row);
              }
            }
            resolve(data);
          } else {
            reject(new Error("不支援檔案格式"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;

      if (file.name.toLowerCase().endsWith(".csv")) {
        reader.readAsText(file, "UTF-8");
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // 格式轉換
  const convertDataTiProductData = (fileData) => {
    return fileData.map((row) => {
      let variants_input = [];
      try {
        if (row.variants_input && typeof row.variants_input === "string") {
          variants_input = JSON.parse(row.variants_input);
        } else if (
          row.variants_input &&
          typeof row.variants_input === "object"
        ) {
          variants_input = row.variants_input;
        } else {
          variants_input = [
            {
              color_name: row.color_name || "Black",
              color_hex: row.color_hex || "000000",
              sizes: JSON.parse(row.sizes || '{"S": 10, "M": 10, "L": 10}'),
            },
          ];
        }
      } catch (error) {
        variants_input = [
          {
            color_name: "Black",
            color_hex: "000000",
            sizes: { S: 10, M: 10, L: 10 },
          },
        ];
      }

      return {
        category_code: row.category_code || "T01",
        style_code: row.style_code || "1234",
        product_name: row.product_name || "Unknown Product",
        category_main: row.category_main || "Top",
        category_sub: row.category_sub || "T-Shirt",
        price: parseFloat(row.price) || 0,
        isNew: row.isNew === true || row.isNew === "true",
        onSale: row.onSale === true || row.onSale === "true",
        discountRate: parseFloat(row.discountRate) || 1.0,
        description: row.description || "",
        materials: row.materials
          ? Array.isArray(row.materials)
            ? row.materials
            : [row.materials]
          : [],
        variants_input: variants_input,
      };
    });
  };

  // SKU 生成
  const generateSKU = (categoryCode, styleCode, colorCode, size) => {
    return `${categoryCode}-${styleCode}-${colorCode}-${size}`;
  };

  // 處理產品資料
  const processProductData = (productData) => {
    return productData.map((data) => {
      const product_id = `${data.category_code}-${data.style_code}`;
      const newPrice = data.onSale
        ? Math.round(data.price * data.discountRate)
        : data.price;

      const variants = data.variants_input.map((variant) => {
        const color_name = variant.color_name;
        const color_code =
          COLOR_CODE_MAP[color_name] ||
          color_name.substring(0, 3).toUpperCase();

        const skus = [];
        Object.entries(variant.sizes).forEach(([size, stock]) => {
          skus.push({
            sku: generateSKU(
              data.category_code,
              data.style_code,
              color_code,
              size
            ),
            size: size,
            stock: stock,
          });
        });

        return {
          color_name: color_name,
          color_code: `#${variant.color_hex}`,
          sizes: variant.sizes,
          skus: skus,
        };
      });

      return {
        product_id: product_id,
        product_name: data.product_name,
        category_main: data.category_main,
        category_sub: data.category_sub,
        price: data.price,
        isNew: data.isNew,
        onSale: data.onSale,
        discountRate: data.discountRate,
        newPrice: newPrice,
        description: data.description,
        materials: data.materials,
        variants: variants,
      };
    });
  };

  // 檔案格式驗證
  const validationFile = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    if (fileExtension !== "csv") {
      return {
        isValid: false,
        message: `不支援的檔案格式: .${fileExtension}。請上傳CSV檔案。`,
      };
    }
    return {
      isValid: true,
      message: "",
    };
  };

  // csv 格式驗證
  const REQUIRED_CSV_FIELDS = [
    "category_code",
    "style_code",
    "product_name",
    "category_main",
    "category_sub",
    "price",
    "isNew",
    "onSale",
    "discountRate",
    "description",
    "materials",
    "variants_input",
  ];

  const validationCSV = (csvData) => {
    if (!csvData || csvData.length === 0) {
      return {
        isValid: false,
        message: "CSV檔案為空或格式不正確",
      };
    }

    const header = Object.keys(csvData[0] || {});
    const missingFields = REQUIRED_CSV_FIELDS.filter(
      (filed) => !header.includes(filed)
    );

    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: `CSV缺少必要欄位: ${missingFields.join(", ")}`,
      };
    }

    const validRows = [];
    const errors = [];

    csvData.forEach((row) => {
      let rowValid = true;

      // 價錢驗證
      if (isNaN(parseFloat(row.price))) {
        rowValid = false;
        errors.push(`商品 : ${row.product_id} 價格必須是數字`);
      }

      // 新品、特價驗證
      ["isNew", "onSale"].forEach((field) => {
        if (!["True", "False"].includes(String(row[field]))) {
          rowValid = false;
          errors.push(`商品 : ${row.product_id} ${field}必須是True 或是 False`);
        }
      });

      // 驗證 variants_input 格式
      try {
        const variants = JSON.parse(row.variants_input);
        if (!Array.isArray(variants)) {
          rowValid = false;
          errors.push(
            `商品 : ${row.product_id} variants_input 必須是 JSON 陣列`
          );
        }
      } catch (error) {
        rowValid = false;
        errors.push(`商品 : ${row.product_id} variants_input 不是合法的 JSON`);
      }

      if (rowValid) validRows.push(row);
    });

    if (validRows.length === 0) {
      return {
        isValid: false,
        message: errors.join("; ") || "CSV檔案沒有包含有效的產品資料",
      };
    }

    return { isValid: true, message: "" };
  };

  // 檔案上傳
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 檔案格式驗證
      const fileValidation = validationFile(file);

      if (!fileValidation) {
        setStatus({
          message: fileValidation.message,
          isError: true,
        });
        setUploadedFile(null);
        e.target.value = "";
        return;
      }

      setUploadedFile(file);
      setStatus({ message: "" });
    }
  };

  // 處理資料
  const processData = async () => {
    if (!uploadedFile) {
      setStatus({ message: "請先上傳資料檔案", isError: true });
      return;
    }
    try {
      setIsProcessing(true);
      setStatus({ message: "", isError: false });

      const fileData = await readFile(uploadedFile);

      // 格式驗證
      const csvValidation = validationCSV(fileData);
      if (!csvValidation) {
        setStatus({
          message: csvValidation.message,
          isError: true,
        });
        return;
      }

      const productData = convertDataTiProductData(fileData);
      const result = processProductData(productData);

      setProcessedData(result);

      sessionStorage.setItem("processedData", JSON.stringify(result));
      sessionStorage.setItem("uploadedFileName", uploadedFile.name);

      setStatus({
        message: `成功轉換 ${result.length} 個商品`,
        isError: false,
      });
    } catch (error) {
      console.error("處理錯誤:", error);
      setStatus({
        message: `${
          error.message.charAt(0).toUpperCase() + error.message.slice(1)
        }`,
        isError: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 檔案下載
  const downloadJSON = () => {
    if (!processData) {
      setStatus({ message: "沒有可下載的資料", isError: true });
    }

    const dataStr = JSON.stringify(processData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `products_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setStatus({ message: "檔案下載完成", isError: false });
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
              資料檔案 (CSV)
            </label>
            <input
              type="file"
              ref={filleInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <div
              onClick={() => filleInputRef.current?.click()}
              className={`w-full px-2 py-6 rounded-md flex flex-col gap-4 items-center cursor-pointer border-2 border-dashed ${
                uploadedFile
                  ? "bg-green-100/50 dark:bg-green-900/30 border-green-500 dark:border-green-700"
                  : "bg-white/50 dark:bg-gray-700/50  border-gray-500/50 dark:border-gray-200/50"
              }  overflow-hidden mb-4`}
            >
              <FileSpreadsheet
                className={`w-10 h-10 md:w-12 md:h-12 mx-auto opacity-50 dark:opacity-80 ${
                  uploadedFile
                    ? "stroke-green-600 dark:stroke-green-300/80"
                    : " dark:stroke-gray-200"
                }`}
              />
              <span
                className={`${
                  uploadedFile
                    ? "text-green-500 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-200"
                }   text-sm md:text-base`}
              >
                {uploadedFile
                  ? `${uploadedFile.name}`
                  : "點擊選擇資料檔案 (CSV)"}
              </span>
            </div>
            <button
              onClick={processData}
              disabled={!uploadedFile || isProcessing}
              className={`w-full py-5 px-2 rounded-md ${
                !uploadedFile || isProcessing
                  ? `opacity-50 bg-gray-600 dark:bg-gray-700 ${
                      isProcessing
                        ? "text-gray-200"
                        : "text-black dark:text-gray-200"
                    }`
                  : "bg-gray-200 hover:text-gray-200 hover:shadow-xl hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800/80"
              } transition-all duration-300 text-sm md:text-lg font-medium`}
            >
              {isProcessing ? "處理中..." : "開始轉換"}
            </button>
            {/* 狀態訊息 */}
            {status.message && (
              <div
                className={`w-full px-2 py-4 rounded-md font-medium text-center flex flex-col gap-3 items-center justify-center space-x-2 ${
                  status.isError
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"
                    : "bg-green-100/50 dark:bg-green-900/30 text-green-500 dark:text-green-300 border border-green-200 dark:border-green-700"
                }`}
              >
                {status.isError ? (
                  <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                )}
                <span>{status.message}</span>
              </div>
            )}
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
                {processedData
                  ? JSON.stringify(processedData, null, 2)
                  : "處理完成後，這裡會顯示生成的JSON資料"}
              </pre>
            </div>
          </div>
          <button
            onClick={downloadJSON}
            disabled={!processData}
            className={`w-full py-5 px-2 rounded-md ${
              processData
                ? " bg-gray-200 hover:text-gray-200 hover:shadow-xl hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800/80"
                : `opacity-50 bg-gray-600 dark:bg-gray-700`
            } transition-all duration-300 text-sm md:text-lg font-medium`}
          >
            下載 JSON 檔案
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
