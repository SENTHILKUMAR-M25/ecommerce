import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../../redux/slices/orderSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Download, Printer, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import  { resolveImage } from "../../services/api";

const OrderInvoice = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  
  const { orderDetails: order, loading } = useSelector((state) => state.orders);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  const handleDownloadPDF = async () => {
    if (isDownloading || !order || !invoiceRef.current) return;
    setIsDownloading(true);

    try {
      if (!window.html2pdf) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const options = {
        margin: 0,
        filename: `Invoice-${order._id.slice(-8).toUpperCase()}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // Strip styles that cause oklch issues
            const styleSheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styleSheets.forEach(s => s.remove());
            const all = clonedDoc.querySelectorAll("*");
            all.forEach(el => {
                el.removeAttribute('class');
                if (el.style.color && el.style.color.includes('oklch')) el.style.color = '#000000';
                if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) el.style.backgroundColor = '#ffffff';
            });
          }
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await window.html2pdf().set(options).from(invoiceRef.current).save();
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Download error. Opening print fallback.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !order) return <LoadingSpinner />;

  const chunkItems = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };

  const itemChunks = chunkItems(order.orderItems, 6);

  const s = {
    page: {
      backgroundColor: '#fffff',
      width: '210mm',
      height: '296mm', // Slightly less than 297mm to prevent ghost pages
      margin: '0 auto',
      padding: '40px',
      boxSizing: 'border-box',
      fontFamily: "'Times New Roman', Times, serif",
      border: '1.5px solid #000',
      position: 'relative',
      overflow: 'hidden',
      color: '#000',
    },
    header: { paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #000', marginBottom: '25px' },
    label: { fontSize: '10px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' },
    tableHeader: { padding: '12px 5px', borderBottom: '2.5px solid #000', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
    tableCell: { padding: '15px 5px', borderBottom: '1px solid #f0f0f0' },
    summary: { marginTop: '10px', display: 'flex', justifyContent: 'flex-end' },
    footer: {
      position: 'absolute',
      bottom: '40px',
      left: '40px',
      right: '40px',
      textAlign: 'center',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 no-print-bg">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { 
            visibility: hidden; 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          #print-area-root, #print-area-root * {
            visibility: visible;
          }
          #print-area-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
          }
          .page-break { 
            page-break-after: always !important; 
            break-after: page !important;
          }
          .no-print { display: none !important; }
        }
        .page-break { margin-bottom: 20px; }
      `}</style>

      {/* Controller */}
      <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center no-print px-4">
        <button onClick={() => navigate(-1)} className="font-bold text-slate-500 hover:text-black flex items-center gap-2 uppercase text-xs">
          <ArrowLeft size={16} /> Exit
        </button>
        <div className="flex gap-4">
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-2.5 rounded-xl font-bold text-xs shadow-lg">
            {isDownloading ? "EXP..." : "DOWNLOAD PDF"}
          </button>
          <button onClick={handlePrint} className="bg-black text-white px-8 py-2.5 rounded-xl font-bold text-xs shadow-lg">
            PRINT A4
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div ref={invoiceRef} id="print-area-root">
        {itemChunks.map((chunk, idx) => (
          <div key={idx} style={s.page} className={`invoice-page shadow-2xl bg-white ${idx < itemChunks.length - 1 ? 'page-break' : ''}`}>
            
            {/* Header: Page 1 Only */}
            {idx === 0 && (
              <>
                <div style={s.header}>
                  <div>
                    <div style={{ color: '#0891b2', fontSize: '11px', fontWeight: 'bold' }}>{order.orderStatus}</div>
                    <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '5px 0' }}>INVOICE</h1>
                    <p style={{ fontSize: '9px', fontWeight: 'bold' }}>REF: #{order._id.slice(-10).toUpperCase()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 'bold', fontStyle: 'italic', margin: '0' }}>VS STORE</h2>
                    <p style={{ fontSize: '12px' }}>Madurai, TN, India</p>
                    <p style={{ fontSize: '10px', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
                  <div>
                    <p style={s.label}>Client</p>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{order.user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{order.user?.email}</div>
                    <div style={{ marginTop: '10px', fontSize: '9px', fontWeight: 'bold', color: '#0891b2' }}>PAYMENT: {order.paymentMethod}</div>
                  </div>
                  <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px' }}>
                    <p style={s.label}>Shipping</p>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{order.shippingAddress.street}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{order.shippingAddress.city}, {order.shippingAddress.state}, IN</div>
                  </div>
                </div>
              </>
            )}

            {/* Pagination */}
            {itemChunks.length > 1 && (
              <div style={{ position: 'absolute', top: '15px', right: '40px', fontSize: '10px', fontWeight: 'bold', color: '#ccc' }}>
                PAGE {idx + 1} / {itemChunks.length}
              </div>
            )}

            {/* Table */}
            <div style={{ flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...s.tableHeader, textAlign: 'left' }}>Product</th>
                    <th style={{ ...s.tableHeader, textAlign: 'center', width: '15%' }}>Qty</th>
                    <th style={{ ...s.tableHeader, textAlign: 'right', width: '20%' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((item, i) => (
                    <tr key={i}>
                      <td style={s.tableCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img src={resolveImage(item.image)} crossOrigin="anonymous" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.name}</div>
                            {item.variant && <div style={{ fontSize: '9px', color: '#777' }}>{item.variant}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...s.tableCell, textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                      <td style={{ ...s.tableCell, textAlign: 'right', fontWeight: 'bold' }}>₹{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Totals: Last Page Only */}
              {idx === itemChunks.length - 1 && (
                <div style={s.summary}>
                  <div style={{ width: '280px' }}>
                    {/* Subtotal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                      <span>Subtotal:</span>
                      <span>₹{order.itemsPrice?.toFixed(2) || (order.totalPrice + order.discountPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</span>
                    </div>

                    {/* Delivery Charge */}
                    {order.shippingPrice > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                        <span>Delivery Charge:</span>
                        <span>₹{order.shippingPrice.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Offer Discount */}
                    {order.discountPrice > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', color: '#059669' }}>
                        <span>Offer Discount:</span>
                        <span>-₹{order.discountPrice.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Tax */}
                    {order.taxPrice > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                        <span>Tax:</span>
                        <span>₹{order.taxPrice.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div style={{ borderTop: '2px solid #000', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>TOTAL:</span>
                      <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0891b2', fontStyle: 'italic' }}>₹{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer on Every Page */}
            <div style={s.footer}>
              <div style={{ display: 'inline-block', color: '#059669', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', padding: '5px 15px', borderRadius: '40px', fontWeight: 'bold', fontSize: '9px', marginBottom: '8px' }}>
                Authorized Record
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>This is an electronically generated record. Thank you.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderInvoice;