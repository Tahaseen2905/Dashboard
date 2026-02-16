import { X, User, MapPin, Briefcase, Layers, GitBranch, Code, Building } from 'lucide-react';

interface CandidateData {
    'employee_id': string;
    'full_name': string;
    'candidate_city': string;
    'designation': string;
    'client_address': string;
    'client_contact_address': string;
    'skill': string;
    'Domain': string;
    'IT/Non IT': string;
    'gender': string;
    'notice_period_from_employee': string;
    'company_name': string;
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
                            {candidate['full_name']?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                {candidate['full_name']}
                            </h2>
                            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                                    ID: {candidate['employee_id']}
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
                            <div style={valueStyle}>{candidate['designation']}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><MapPin size={14} /> LOCATION</div>
                            <div style={valueStyle}>{candidate['candidate_city']}</div>
                        </div>

                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><User size={14} /> EXPERIENCE</div>
                            <div style={valueStyle}>{candidate['total_experience'] || 'N/A'}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><User size={14} /> GENDER</div>
                            <div style={valueStyle}>{candidate['gender'] || '-'}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><Briefcase size={14} /> NOTICE PERIOD</div>
                            <div style={valueStyle}>{candidate['notice_period_from_employee'] ? `${candidate['notice_period_from_employee']} Days` : '-'}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><Building size={14} /> CURRENT COMPANY</div>
                            <div style={valueStyle}>{candidate['company_name'] || '-'}</div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><Layers size={14} /> IT/Non IT</div>
                            <div style={valueStyle}>{candidate['IT/Non IT']}</div>
                        </div>
                        <div style={infoSectionStyle}>
                            <div style={labelStyle}><GitBranch size={14} /> DOMAIN</div>
                            <div style={valueStyle}>{candidate['Domain']}</div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    {candidate['skill'] && (
                        <div style={{ ...infoSectionStyle, marginTop: '0.5rem' }}>
                            <div style={{ ...labelStyle, marginBottom: '0.75rem' }}><Code size={14} /> TOP SKILLS</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {candidate['skill'].split(',').map((skill, i) => (
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
