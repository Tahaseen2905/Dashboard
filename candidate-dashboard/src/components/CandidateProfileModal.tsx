import { X, User, MapPin, Briefcase, Building, Layers, GitBranch, Code } from 'lucide-react';

interface CandidateData {
    'Employee ID': string;
    'Candidate Name': string;
    'Location': string;
    'skills': string;
    'client': string;
    'roleDesignation': string;
    'vertical': string;
    'department type': string;
    'experienceYears'?: string | number;
    [key: string]: any;
}

interface CandidateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: CandidateData | null;
}

export default function CandidateProfileModal({ isOpen, onClose, candidate }: CandidateProfileModalProps) {
    if (!isOpen || !candidate) return null;

    const infoSectionStyle = {
        background: 'rgba(0,0,0,0.02)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--card-border, #e2e8f0)',
    };

    const labelStyle = {
        fontSize: '0.75rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        color: '#64748b',
        marginBottom: '0.25rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
    };

    const valueStyle = {
        fontSize: '1rem',
        fontWeight: 500,
        color: 'var(--text-color, #1e293b)'
    };

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
            zIndex: 1010, // Higher than client modal just in case
            padding: '1rem'
        }}
            onClick={onClose}
        >
            <div style={{
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--text-color, #1e293b)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--card-border, #e2e8f0)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out'
            }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {candidate['Candidate Name']?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                {candidate['Candidate Name']}
                            </h2>
                            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                                    ID: {candidate['Employee ID']}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Basic Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><Briefcase size={14} /> ROLE</div>
                            <div style={valueStyle}>{candidate['roleDesignation']}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><MapPin size={14} /> LOCATION</div>
                            <div style={valueStyle}>{candidate['Location']}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><Building size={14} /> CLIENT</div>
                            <div style={valueStyle}>{candidate['client']}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><User size={14} /> EXPERIENCE</div>
                            <div style={valueStyle}>{candidate['experienceYears'] || 'N/A'} Years</div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><Layers size={14} /> INDUSTRY</div>
                            <div style={valueStyle}>{candidate['vertical']}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><GitBranch size={14} /> DOMAIN</div>
                            <div style={valueStyle}>{candidate['department type']}</div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    {candidate['skills'] && (
                        <div style={{ ...infoSectionStyle, marginTop: '0.5rem' }}>
                            <div style={{ ...labelStyle, marginBottom: '0.75rem' }}><Code size={14} /> TOP SKILLS</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {candidate['skills'].split(',').map((skill, i) => (
                                    <span key={i} style={{
                                        background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                                        color: '#1e40af',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        border: '1px solid #bfdbfe'
                                    }}>
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
