import QRCode from "@/components/cards/qr-code";

const SettingsQRCode = () => {
  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">QR Code</h3>
        <p className="text-black/50 text-sm font-medium">
          Download QR Code business card.
        </p>
      </div>

      <QRCode />
    </div>
  );
};

export default SettingsQRCode;
