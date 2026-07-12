export function generateEventPassHtml(params: {
  collegeName: string;
  eventName: string;
  studentName: string;
  department: string;
  year: string;
  date: string;
  time: string;
  roomNumber: string;
  location: string;
  reportingTime: string;
  registrationId: string;
  qrDataUrl: string;
  organizerName: string;
  instructions: string;
}): string {
  const { collegeName, eventName, studentName, department, year, date, time, roomNumber, location, reportingTime, registrationId, qrDataUrl, organizerName, instructions } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',-apple-system,sans-serif;background:#0a0a14;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}
.ticket{max-width:420px;width:100%;background:linear-gradient(145deg,#13132b,#1a1a3e);border-radius:28px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 24px;text-align:center;}
.header h1{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin:0;}
.header p{font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;text-transform:uppercase;letter-spacing:1px;}
.body{padding:28px 24px;}
.event-name{font-size:20px;font-weight:700;color:#f5f5f5;margin-bottom:20px;text-align:center;}
.info-table{width:100%;border-collapse:collapse;}
.info-table tr{border-bottom:1px solid rgba(255,255,255,0.04);}
.info-table tr:last-child{border-bottom:none;}
.info-table td{padding:10px 0;font-size:13px;}
.info-table td:first-child{color:rgba(255,255,255,0.4);width:90px;}
.info-table td:last-child{color:#f5f5f5;font-weight:500;}
.qr-section{text-align:center;margin:24px 0;padding:20px;background:rgba(255,255,255,0.03);border-radius:20px;}
.qr-section img{width:180px;height:180px;border-radius:12px;background:#fff;padding:12px;}
.qr-section p{font-size:12px;color:rgba(255,255,255,0.4);margin-top:12px;}
.registration-id{text-align:center;margin:16px 0;}
.registration-id span{font-size:18px;font-weight:700;color:#818cf8;letter-spacing:1px;}
.footer{padding:20px 24px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);text-align:center;}
.footer p{font-size:10px;color:rgba(255,255,255,0.25);line-height:1.5;}
.instructions{background:rgba(255,255,255,0.03);border-radius:16px;padding:16px;margin-top:16px;}
.instructions h3{font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;}
.instructions p{font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;}
@media print{body{background:#fff;padding:0;}.ticket{box-shadow:none;border:2px solid #eee;}}
</style>
</head>
<body>
<div class="ticket">
<div class="header">
<h1>${collegeName || 'DEMP'}</h1>
<p>Event Pass</p>
</div>
<div class="body">
<div class="event-name">${eventName}</div>
<table class="info-table">
${studentName ? `<tr><td>Name</td><td>${studentName}</td></tr>` : ''}
${department ? `<tr><td>Department</td><td>${department}</td></tr>` : ''}
${year ? `<tr><td>Year</td><td>${year}</td></tr>` : ''}
<tr><td>Date</td><td>${date}</td></tr>
<tr><td>Time</td><td>${time}</td></tr>
${roomNumber ? `<tr><td>Room</td><td>${roomNumber}</td></tr>` : ''}
<tr><td>Venue</td><td>${location}</td></tr>
${reportingTime ? `<tr><td>Reporting</td><td>${reportingTime}</td></tr>` : ''}
${organizerName ? `<tr><td>Organizer</td><td>${organizerName}</td></tr>` : ''}
</table>
<div class="registration-id">
<span>${registrationId}</span>
</div>
${qrDataUrl ? `<div class="qr-section"><img src="${qrDataUrl}" alt="QR Code"/><p>Present this at the venue for check-in</p></div>` : ''}
${instructions ? `<div class="instructions"><h3>Instructions</h3><p>${instructions}</p></div>` : ''}
</div>
<div class="footer">
<p>This is a computer-generated pass. No signature required.</p>
</div>
</div>
</body></html>`;
}
