import React, { useState } from 'react';
import { FileDown, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import '../styles/ExportToExcel.css';

const ExportToExcel = ({ data, fileName = 'export', columns }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(
        columns.reduce((acc, column) => {
            acc[column.key] = true;
            return acc;
        }, {})
    );

    const toggleColumn = (key) => {
        setSelectedColumns({
            ...selectedColumns,
            [key]: !selectedColumns[key],
        });
    };

    const selectAllColumns = () => {
        const allSelected = {};
        columns.forEach(column => {
            allSelected[column.key] = true;
        });
        setSelectedColumns(allSelected);
    };

    const deselectAllColumns = () => {
        const allDeselected = {};
        columns.forEach(column => {
            allDeselected[column.key] = false;
        });
        setSelectedColumns(allDeselected);
    };

    const exportToExcel = () => {
        // Seçili sütunlara göre filtreleme
        const filteredColumns = columns.filter(column => selectedColumns[column.key]);

        // Verileri hazırla
        const exportData = data.map(item => {
            const row = {};
            filteredColumns.forEach(column => {
                // Kompleks veri yapıları için özel işleme
                if (column.accessor && typeof column.accessor === 'function') {
                    row[column.header] = column.accessor(item);
                } else if (column.key.includes('.')) {
                    // Nested objeleri işleme (örn: personnel.name)
                    const keys = column.key.split('.');
                    let value = item;
                    for (const key of keys) {
                        value = value?.[key];
                        if (value === undefined) break;
                    }
                    row[column.header] = value !== undefined ? value : '';
                } else {
                    row[column.header] = item[column.key] !== undefined ? item[column.key] : '';
                }
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Excel dosyasını oluştur ve indir
        XLSX.writeFile(workbook, `${fileName}.xlsx`);

        // Modal'ı kapat
        setIsModalOpen(false);
    };

    return (
        <div className="export-excel-container">
            <button
                className="export-excel-button"
                onClick={() => setIsModalOpen(true)}
            >
                <FileDown size={16} />
                <span>Excel'e Aktar</span>
            </button>

            {isModalOpen && (
                <div className="export-modal-overlay">
                    <div className="export-modal">
                        <div className="export-modal-header">
                            <h3>Excel'e Aktarılacak Sütunları Seçin</h3>
                            <button
                                className="export-modal-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="export-modal-body">
                            <div className="export-select-all">
                                <button
                                    className="export-select-button"
                                    onClick={selectAllColumns}
                                >
                                    Tümünü Seç
                                </button>
                                <button
                                    className="export-deselect-button"
                                    onClick={deselectAllColumns}
                                >
                                    Tümünü Kaldır
                                </button>
                            </div>

                            <div className="export-columns-list">
                                {columns.map((column) => (
                                    <div key={column.key} className="export-column-item">
                                        <label className="export-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedColumns[column.key] || false}
                                                onChange={() => toggleColumn(column.key)}
                                                className="export-checkbox"
                                            />
                                            <span className="export-checkbox-custom">
                        {selectedColumns[column.key] && <Check size={12} />}
                      </span>
                                            {column.header}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="export-modal-footer">
                            <button
                                className="export-cancel-button"
                                onClick={() => setIsModalOpen(false)}
                            >
                                İptal
                            </button>
                            <button
                                className="export-confirm-button"
                                onClick={exportToExcel}
                            >
                                Excel'e Aktar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportToExcel;