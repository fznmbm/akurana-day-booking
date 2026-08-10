import { config } from "../config";
import { ConfigProvider } from "../contexts/ConfigContext";

export const metadata = {
  title: config.event.fullName,
  description: `RSVP for ${config.organization.fullName} ${config.event.name}`,

  // title: "Islah Trust Eid-Ul-Adha 2026",
  // description: "RSVP for Islah Trust Eid-Ul-Adha Lunch & Family Gathering 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 40px;
            margin-bottom: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #667eea;
            font-size: 2rem;
            margin-bottom: 10px;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 1.1rem;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
          }
          
          input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
          }
          
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
          }
          
          textarea {
            min-height: 100px;
            resize: vertical;
          }
          
          .ticket-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .ticket-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
          }
          
          .ticket-card label {
            margin-bottom: 5px;
            font-size: 0.9rem;
          }
          
          .ticket-card .price {
            color: #667eea;
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
          }
          
          .ticket-card input {
            text-align: center;
            font-size: 1.2rem;
            font-weight: bold;
          }
          
          button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
          }
          
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .total-amount {
            background: #f0f7ff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .total-amount .label {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 5px;
          }
          
          .total-amount .amount {
            color: #667eea;
            font-size: 2rem;
            font-weight: bold;
          }
          
          .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
          
          .alert-info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
          }
          
          .info-box {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .info-box h3 {
            color: #856404;
            margin-bottom: 10px;
          }
          
          .info-box p {
            color: #856404;
            margin-bottom: 5px;
          }
          
          .table-container {
            overflow-x: auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          
          th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
          }
          
          tr:hover {
            background: #f8f9fa;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          
          .stat-card .number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .stat-card .label {
            font-size: 0.9rem;
            opacity: 0.9;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
          }
          
          .badge-pending {
            background: #ffeaa7;
            color: #d63031;
          }
          
          .badge-paid {
            background: #55efc4;
            color: #00b894;
          }
          
          .badge-confirmed {
            background: #74b9ff;
            color: #0984e3;
          }
          
          .action-buttons {
            display: flex;
            gap: 10px;
          }
          
          .btn-small {
            padding: 6px 12px;
            font-size: 0.9rem;
            width: auto;
          }
          
          .btn-danger {
            background: #e74c3c;
          }
          
          .btn-danger:hover:not(:disabled) {
            background: #c0392b;
          }
          
          .search-box {
            margin-bottom: 20px;
          }
          
          @media (max-width: 768px) {
            body {
              padding: 10px;
            }
            
            .card {
              padding: 20px;
            }
            
            .header h1 {
              font-size: 1.5rem;
            }
            
            .ticket-group {
              grid-template-columns: 1fr;
            }
            
            table {
              font-size: 0.9rem;
            }
            
            th, td {
              padding: 8px;
            }
          }
        `}</style>
      </head>
      <body>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}
