'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const navLinks = [
  { name: 'General', href: '/' },
  { name: 'JVA Infusion', href: '/jva-infusion' },
  { name: 'Clean-Up', href: '/clean-up' },
  { name: 'External Gap Lots', href: '/external-gap-lots' },
  { name: 'MJCI', href: '/mjci' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const captureChart = async (chartId: string): Promise<string> => {
    const chartElement = document.querySelector(`#${chartId}`) as HTMLElement;
    if (!chartElement) return '';

    // Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#1E3D59',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    return canvas.toDataURL('image/png', 1.0);
  };

  const handleExportPDF = async () => {
    try {
      // First generate and print the metrics and table
      document.body.classList.add('printing');
      window.print();
      document.body.classList.remove('printing');

      // Then handle charts with jsPDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Dashboard Analytics', pageWidth / 2, margin, { align: 'center' });

      // Calculate chart dimensions for 2x2 grid
      const chartWidth = (pageWidth - (margin * 3)) / 2;
      const chartHeight = (pageHeight - (margin * 4)) / 2;

      // Define chart positions with proper spacing
      const charts = [
        { id: 'infused-area-chart', title: 'Infused Area by Land Group', x: margin, y: margin * 2 },
        { id: 'mapped-parcels-chart', title: 'Mapped Parcels per Group', x: margin * 2 + chartWidth, y: margin * 2 },
        { id: 'akl-ownership-chart', title: 'AKL Ownership Breakdown', x: margin, y: margin * 3 + chartHeight },
        { id: 'area-comparison-chart', title: 'Area Comparison by Group', x: margin * 2 + chartWidth, y: margin * 3 + chartHeight }
      ];

      // Process each chart
      for (const chart of charts) {
        const chartElement = document.querySelector(`#${chart.id}`) as HTMLElement;
        if (chartElement) {
          // Wait for any animations to complete
          await new Promise(resolve => setTimeout(resolve, 100));

          // Get the chart canvas
          const canvas = chartElement.querySelector('canvas');
          if (canvas) {
            // Create a temporary canvas for manipulation
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              // Copy original canvas content
              tempCtx.fillStyle = '#FFFFFF';
              tempCtx.fillRect(0, 0, canvas.width, canvas.height);
              tempCtx.drawImage(canvas, 0, 0);

              // Get image data
              const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;

              // Convert to high contrast black and white
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate perceived brightness
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                
                // If pixel is text-like (dark), make it pure black
                if (brightness < 128) {
                  data[i] = 0;     // R
                  data[i + 1] = 0; // G
                  data[i + 2] = 0; // B
                } else {
                  // Keep white/light colors as is
                  data[i] = r;
                  data[i + 1] = g;
                  data[i + 2] = b;
                }
              }

              // Put the processed image back
              tempCtx.putImageData(imageData, 0, 0);

              // Add chart title with pure black
              pdf.setFontSize(12);
              pdf.setTextColor(0, 0, 0);
              pdf.text(chart.title, chart.x, chart.y - 5);

              // Add chart to PDF
              const imgData = tempCanvas.toDataURL('image/png', 1.0);
              pdf.addImage(imgData, 'PNG', chart.x, chart.y, chartWidth, chartHeight);
            }
          }
        }
      }

      // Add footer with date
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Generated on ${today}`, pageWidth - margin, pageHeight - margin, { align: 'right' });

      // Save the PDF
      pdf.save('dashboard-charts.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <nav className="bg-[rgb(0,35,42)] text-[#C8C2AE] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src="/data/aeralogo.png"
                alt="AERA Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <h1 className="ml-3 text-xl font-bold text-[#34E4EA]">
            </h1>
          </div>

          <div className="flex items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === link.href
                        ? 'bg-[#34E4EA] text-[rgb(0,35,42)]'
                        : 'hover:bg-[#34E4EA]/20'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-[#34E4EA]/20 flex items-center"
              title="Export as PDF"
            >
              <FaPrint className="h-5 w-5" />
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-[#34E4EA]/20 focus:outline-none"
              >
                {isOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? 'bg-[#34E4EA] text-[rgb(0,35,42)]'
                  : 'hover:bg-[#34E4EA]/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 