package com.umut.passwise.dto.requests;

public class QrCodeAccessRequestDto {
    private String qrCodeContent;
    private Long scanningPersonnelId; // QR kodu taratan personelin ID'si

    // Getter ve Setter metotları
    public String getQrCodeContent() {
        return qrCodeContent;
    }

    public void setQrCodeContent(String qrCodeContent) {
        this.qrCodeContent = qrCodeContent;
    }

    public Long getScanningPersonnelId() {
        return scanningPersonnelId;
    }

    public void setScanningPersonnelId(Long scanningPersonnelId) {
        this.scanningPersonnelId = scanningPersonnelId;
    }
}