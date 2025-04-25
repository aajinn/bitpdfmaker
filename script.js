const input = document.getElementById("pdf-upload");
const output = document.getElementById("main-text");
const progress = document.getElementById("progress");
const rowsInput = document.getElementById("rowsSlider");
const colsInput = document.getElementById("columnsSlider");
const marginInput = document.getElementById("marginSlider");
const paddingXInput = document.getElementById("paddingXSlider");
const paddingYInput = document.getElementById("paddingYSlider");
const generateBtn = document.getElementById("generate-grid");
const gridContainer = document.getElementById("grid");
const downloadBtn = document.getElementById("download-pdf");
const rowSpacingInput =
        document.getElementById("rowSpacingSlider");
const rowSpacingLabel =
        document.getElementById("rowSpacingLabel");
const fontSizeSelect = document.getElementById("fontSizeSelect");
const settingsToggle =
        document.getElementById("settings-toggle");
const settingsContent =
        document.getElementById("settings-content");
const toggleIcon = document.getElementById("toggle-icon");

// Settings accordion functionality
settingsToggle.addEventListener("click", function () {
        settingsContent.classList.toggle("hidden");
        toggleIcon.classList.toggle("rotate-180");
});

pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

const sliders = [
        { id: "rowsSlider", label: "rowsLabel" },
        { id: "columnsSlider", label: "columnsLabel" },
        { id: "marginSlider", label: "marginLabel" },
        { id: "paddingXSlider", label: "paddingXLabel" },
        { id: "paddingYSlider", label: "paddingYLabel" },
        { id: "rowSpacingSlider", label: "rowSpacingLabel" },
];

sliders.forEach(({ id, label }) => {
        const slider = document.getElementById(id);
        const labelEl = document.getElementById(label);
        slider.addEventListener("input", () => {
                labelEl.textContent = slider.value;
        });
});

fontSizeSelect.addEventListener("change", () => {
        updateFontSize();
});

function updateFontSize() {
        const fontSize = fontSizeSelect.value;
        Array.from(
                gridContainer.querySelectorAll("textarea")
        ).forEach((el) => {
                el.style.fontSize = fontSize + "pt";
        });
}

input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show processing message
        progress.textContent = "Starting PDF processing...";
        progress.classList.add("animate-pulse");

        const reader = new FileReader();
        reader.onload = async function () {
                try {
                        const typedarray = new Uint8Array(this.result);
                        const pdf = await pdfjsLib.getDocument({
                                data: typedarray,
                        }).promise;

                        let fullText = "";
                        for (let i = 1; i <= pdf.numPages; i++) {
                                progress.textContent = `Processing page ${i} of ${pdf.numPages}...`;
                                const page = await pdf.getPage(i);
                                const viewport = page.getViewport({
                                        scale: 2,
                                });
                                const canvas =
                                        document.createElement("canvas");
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                await page.render({
                                        canvasContext: canvas.getContext("2d"),
                                        viewport,
                                }).promise;
                                const dataUrl =
                                        canvas.toDataURL("image/png");
                                const result = await Tesseract.recognize(
                                        dataUrl,
                                        "eng",
                                        {
                                                logger: (m) => {
                                                        if (
                                                                m.status ===
                                                                "recognizing text"
                                                        ) {
                                                                progress.textContent = `Page ${i}/${pdf.numPages
                                                                        } - ${Math.round(
                                                                                m.progress * 100
                                                                        )}% OCR`;
                                                        }
                                                },
                                        }
                                );
                                fullText += result.data.text + " ";
                        }
                        const cleaned = fullText
                                .replace(/\s+/g, " ")
                                .replace(/\s*\.\s*/g, ". ")
                                .trim();
                        output.value = cleaned;
                        progress.textContent =
                                "OCR Complete. You may now create the grid.";
                        progress.classList.remove("animate-pulse");
                } catch (err) {
                        progress.textContent =
                                "Error processing PDF: " + err.message;
                        progress.classList.remove("animate-pulse");
                }
        };
        reader.readAsArrayBuffer(file);
});

generateBtn.addEventListener("click", () => {
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        const cells = rows * cols;
        const fullText = output.value.trim();

        if (!fullText) {
                progress.textContent = "Please load a PDF first.";
                return;
        }

        // Calculate the approximate number of characters per cell
        const chunkSize = Math.floor(fullText.length / cells);
        const remainder = fullText.length % cells;

        // Create an array to hold the chunks of text
        let parts = [];
        let startIndex = 0;

        // Distribute the text into cells ensuring each cell gets full text without cutting words
        for (let i = 0; i < cells; i++) {
                let endIndex =
                        startIndex + chunkSize + (i < remainder ? 1 : 0);

                // Adjust endIndex to ensure no word is cut off
                if (endIndex < fullText.length) {
                        // Find the last space before the chunk end
                        const spaceIndex = fullText.lastIndexOf(
                                " ",
                                endIndex
                        );
                        const punctuationIndex = fullText.lastIndexOf(
                                ".",
                                endIndex
                        );
                        const nextSplitIndex = Math.max(
                                spaceIndex,
                                punctuationIndex
                        );

                        // If we found a valid space or punctuation, adjust the endIndex
                        if (
                                nextSplitIndex !== -1 &&
                                nextSplitIndex > startIndex
                        ) {
                                endIndex = nextSplitIndex + 1; // Include the space or punctuation
                        }
                }

                // Add the chunk to the parts array
                parts.push(
                        fullText.slice(startIndex, endIndex).trim()
                );
                startIndex = endIndex;
        }

        // Ensure no empty chunks are added (in case of leftover empty spaces)
        parts = parts.filter((part) => part.length > 0);

        // Set up grid for mobile responsiveness
        gridContainer.innerHTML = "";

        // Adjust grid columns based on device width
        const isMobile = window.innerWidth < 640;
        const actualCols = isMobile ? Math.min(cols, 2) : cols;

        gridContainer.style.gridTemplateColumns = `repeat(${actualCols}, minmax(0, 1fr))`;

        // Create grid cells (textareas) and distribute the chunks
        for (let i = 0; i < parts.length; i++) {
                const cell = document.createElement("textarea");
                cell.className =
                        "w-full h-32 p-2 border rounded-md text-sm resize-none";
                cell.value = parts[i] || "";
                cell.style.fontSize = fontSizeSelect.value + "pt";
                cell.addEventListener("input", () => {
                        const updated = Array.from(
                                gridContainer.querySelectorAll("textarea")
                        )
                                .map((el) => el.value.trim())
                                .join(" ");
                        output.value = updated;
                });
                gridContainer.appendChild(cell);
        }

        // Scroll to the grid
        gridContainer.scrollIntoView({ behavior: "smooth" });
});

downloadBtn.addEventListener("click", () => {
        if (gridContainer.children.length === 0) {
                progress.textContent = "Please generate a grid first";
                return;
        }

        progress.textContent = "Generating PDF...";

        const { jsPDF } = window.jspdf;
        const pageSize =
                document.getElementById("pageSizeSelect").value;
        const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: pageSize,
        });

        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        const margin = parseFloat(marginInput.value);
        const paddingX = parseFloat(paddingXInput.value);
        const paddingY = parseFloat(paddingYInput.value);
        const rowSpacing = parseFloat(rowSpacingInput.value);
        const fontSize = parseInt(fontSizeSelect.value);

        const textArr = Array.from(
                gridContainer.querySelectorAll("textarea")
        ).map((el) => el.value.trim());

        const pageDims = doc.internal.pageSize;
        const pageWidth = pageDims.getWidth() - 2 * margin;
        const pageHeight = pageDims.getHeight() - 2 * margin;
        const cellWidth = pageWidth / cols;
        let cellHeight = pageHeight / rows;

        // Adjust row height if there are only 2 rows
        if (rows === 2) {
                // If there are only two rows, set the height to use the full height of the page
                cellHeight = pageHeight / 2;
        } else {
                // Otherwise, use the rowSpacing as usual
                cellHeight += rowSpacing;
        }

        let x = margin,
                y = margin,
                col = 0,
                row = 0;

        // Drawing the text into cells
        textArr.forEach((text, i) => {
                doc.setFontSize(fontSize);
                doc.text(text, x + paddingX, y + paddingY + 4, {
                        maxWidth: cellWidth - 2 * paddingX,
                });
                col++;
                x += cellWidth;
                if (col >= cols) {
                        col = 0;
                        row++;
                        x = margin;
                        y += cellHeight;
                        if (row >= rows && i < textArr.length - 1) {
                                doc.addPage();
                                row = 0;
                                y = margin;
                        }
                }
        });

        // Placing "BitMakerPdf.pro" at random positions in the four corners
        const watermarkText = "BitMakerPdf.pro";
        const watermarkFontSize = 10;
        const watermarkColor = [255, 0, 0]; // red color

        // Randomly place the watermark text in the four corners
        const positions = [
                { x: margin, y: margin + 5 }, // Top-left corner
                {
                        x:
                                pageDims.getWidth() -
                                margin -
                                doc.getTextWidth(watermarkText),
                        y: margin + 5,
                }, // Top-right corner
                { x: margin, y: pageDims.getHeight() - margin }, // Bottom-left corner
                {
                        x:
                                pageDims.getWidth() -
                                margin -
                                doc.getTextWidth(watermarkText),
                        y: pageDims.getHeight() - margin,
                }, // Bottom-right corner
        ];

        // Randomly select a position
        const randomPosition =
                positions[
                Math.floor(Math.random() * positions.length)
                ];

        doc.setTextColor(
                watermarkColor[0],
                watermarkColor[1],
                watermarkColor[2]
        );
        doc.setFontSize(watermarkFontSize);
        doc.setFont("helvetica", "normal");

        // Add the watermark text at the randomly selected position
        doc.text(watermarkText, randomPosition.x, randomPosition.y);

        // Saving the PDF
        doc.save("BitMakerPDF.pdf");
        progress.textContent = "PDF downloaded successfully!";

        // Clear message after a delay
        setTimeout(() => {
                progress.textContent = "";
        }, 3000);
});

// Handle window resize events for responsive grid
window.addEventListener("resize", function () {
        if (gridContainer.children.length > 0) {
                const isMobile = window.innerWidth < 640;
                const cols = parseInt(colsInput.value);
                const actualCols = isMobile ? Math.min(cols, 2) : cols;
                gridContainer.style.gridTemplateColumns = `repeat(${actualCols}, minmax(0, 1fr))`;
        }
});

// Initialize settings panel (show by default on larger screens, hide on mobile)
if (window.innerWidth < 768) {
        settingsContent.classList.add("hidden");
}