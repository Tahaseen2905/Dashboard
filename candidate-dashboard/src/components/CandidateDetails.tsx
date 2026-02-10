import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, Sun, Moon, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import j2wLogo from '../assets/j2w.svg';
import ClientDetailsModal from './ClientDetailsModal';
import CandidateProfileModal from './CandidateProfileModal';
import DashboardChatbot from './DashboardChatbot';

interface CandidateData {
    'Employee ID': string;
    'Candidate Name': string;
    'Location': string;
    'skills': string;
    'client': string;
    'roleDesignation': string;
    'vertical': string;
    'department type': string;
    [key: string]: any;
}

export default function CandidateDetails() {
    const [data, setData] = useState<CandidateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

    const handleClientClick = (client: string) => {
        setSelectedClient(client);
    };

    const handleCandidateClick = (candidate: CandidateData) => {
        setSelectedCandidate(candidate);
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
        XLSX.writeFile(workbook, "Candidate_Data_Export.xlsx");
    };

    // Load theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/align360_highlighted_replaced_with_NA.xlsx?v=${Date.now()}`);
                if (!response.ok) throw new Error('Failed to fetch Excel file');

                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<CandidateData>(worksheet);

                setData(jsonData);
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred while loading data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Pagination Logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ color: '#94a3b8' }}>Loading candidate data...</p>
        </div>
    );

    if (error) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
            <h2>Error Loading Data</h2>
            <p>{error}</p>
        </div>
    );

    return (
        <div style={{ padding: '1rem', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={j2wLogo} alt="J2W Logo" style={{ height: '40px', width: 'auto', marginRight: '0.5rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                        Candidate Details
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#f8fafc' : '#1e293b',
                            border: '1px solid var(--card-border)',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>

                    <button
                        onClick={handleExport}
                        style={{
                            background: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#f8fafc' : '#1e293b',
                            border: '1px solid var(--card-border)',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Download size={20} />
                        Export
                    </button>

                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-color)',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            width: '40px',
                            height: '40px'
                        }}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Candidate Details Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={24} style={{ color: '#3b82f6' }} />
                    Detailed Candidate List
                </h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Role</th>
                                <th>Client</th>
                                <th>Skills</th>
                                <th>Industry Type</th>
                                <th>Domain</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((candidate, index) => (
                                <tr key={index}>
                                    <td style={{ fontWeight: 500 }}>{candidate['Employee ID']}</td>
                                    <td
                                        onClick={() => handleCandidateClick(candidate)}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                {candidate['Candidate Name']?.charAt(0) || 'U'}
                                            </div>
                                            <span style={{ fontWeight: 600, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                                {candidate['Candidate Name']}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{candidate['Location']}</td>
                                    <td>
                                        <span style={{
                                            background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#e0f2fe',
                                            color: isDarkMode ? '#60a5fa' : '#0369a1',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {candidate['roleDesignation']}
                                        </span>
                                    </td>
                                    <td
                                        onClick={() => handleClientClick(candidate['client'])}
                                        style={{
                                            cursor: 'pointer',
                                            color: '#3b82f6',
                                            fontWeight: 500,
                                            textDecoration: 'underline',
                                            textUnderlineOffset: '2px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                                    >
                                        {candidate['client']}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {candidate['skills']?.split(',').slice(0, 3).map((skill, i) => (
                                                <span key={i} style={{
                                                    background: isDarkMode ? 'rgba(52, 211, 153, 0.1)' : '#dcfce7',
                                                    color: isDarkMode ? '#34d399' : '#15803d',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                            {(candidate['skills']?.split(',').length || 0) > 3 && (
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    +{(candidate['skills']?.split(',').length || 0) - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{candidate['vertical']}</td>
                                    <td>{candidate['department type']}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--text-color)', opacity: 0.2 }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} candidates
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--card-border)',
                                background: 'transparent',
                                color: 'var(--text-color)',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 1 ? 0.5 : 1
                            }}
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum = currentPage;
                            if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            if (pageNum > 0 && pageNum <= totalPages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: '8px',
                                            border: pageNum === currentPage ? 'none' : '1px solid var(--card-border)',
                                            background: pageNum === currentPage ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
                                            color: pageNum === currentPage ? 'white' : 'var(--text-color)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--card-border)',
                                background: 'transparent',
                                color: 'var(--text-color)',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                opacity: currentPage === totalPages ? 0.5 : 1
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <ClientDetailsModal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                clientName={selectedClient}
                candidates={data.filter(c => c.client === selectedClient)}
            />

            <CandidateProfileModal
                isOpen={!!selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                candidate={selectedCandidate}
            />

            {/* AI Chatbot */}
            <DashboardChatbot data={data} />
        </div>
    );
}
