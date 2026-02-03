import { X, Search } from 'lucide-react';

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

interface ClientDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string | null;
    candidates: CandidateData[];
}

export default function ClientDetailsModal({ isOpen, onClose, clientName, candidates }: ClientDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--text-color, #1e293b)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--card-border, #e2e8f0)',
                overflow: 'hidden'
            }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--card-border, #e2e8f0)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1' }}>
                            <Search size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{clientName}</h2>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                                Found {candidates.length} candidates
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>Role</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>Location</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>Experience</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate, idx) => (
                                    <tr key={idx} style={{ background: 'rgba(0,0,0,0.02)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{candidate['Candidate Name']}</td>
                                        <td style={{ padding: '0.75rem' }}>{candidate['roleDesignation']}</td>
                                        <td style={{ padding: '0.75rem' }}>{candidate['Location']}</td>
                                        <td style={{ padding: '0.75rem' }}>{candidate['experienceYears'] || 'N/A'}</td>
                                    </tr>
                                ))}
                                {candidates.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                            No candidates found for this client.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
