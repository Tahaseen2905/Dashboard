import { useNavigate } from 'react-router-dom';
import DashboardChatbot from './DashboardChatbot';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { Briefcase, MapPin, Users, Code, Search, Sun, Moon, Building, Info } from 'lucide-react';
import j2wLogo from '../assets/j2w.svg';

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

interface ChartData {
    name: string;
    count: number;
}

export const CHART_COLORS = [
    //"#0F172A", // Navy (dark anchor)
    "#1E3A8A", // Deep Blue
    "#1D4ED8", // Strong Blue
    "#2563EB", // Primary Blue
    "#3B82F6", // Bright Blue
    "#60A5FA", // Soft Blue
    "#38BDF8", // Sky Blue
    "#22D3EE", // Cyan
    "#14B8A6", // Teal
    "#0D9488", // Deep Teal
];

const InfoTooltip = ({ text }: { text: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', marginLeft: '0.5rem', cursor: 'help', verticalAlign: 'middle' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <Info size={16} color="#94a3b8" />
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    zIndex: 50,
                    pointerEvents: 'none',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {text}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-4px',
                        borderWidth: '4px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(15, 23, 42, 0.9) transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};

export default function CandidateDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState<CandidateData[]>([]);
    const [allLocationData, setAllLocationData] = useState<ChartData[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

    const [allSkillsData, setAllSkillsData] = useState<ChartData[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const [allClientData, setAllClientData] = useState<ChartData[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);

    const [allRoleData, setAllRoleData] = useState<ChartData[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [allVerticalData, setAllVerticalData] = useState<ChartData[]>([]);
    const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [allDepartmentTypeData, setAllDepartmentTypeData] = useState<ChartData[]>([]);

    // Search States for Dropdowns
    const [clientSearch, setClientSearch] = useState('');
    const [roleSearch, setRoleSearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [skillSearch, setSkillSearch] = useState('');
    const [verticalSearch, setVerticalSearch] = useState('');

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Add styles for icon animation
    const styles = `
        .icon-wrapper {
            transition: transform 0.3s ease;
        }
        .glass-card:hover .icon-wrapper {
            transform: scale(1.1) rotate(5deg);
        }
    `;

    // Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const chartStyles = {
        contentStyle: {
            backgroundColor: isDarkMode ? '#1e293b' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        itemStyle: {
            color: isDarkMode ? '#f8fafc' : '#1e293b'
        },
        cursor: {
            fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
        },
        grid: { stroke: isDarkMode ? '#475569' : '#cbd5e1' },
        axis: { stroke: isDarkMode ? '#94a3b8' : '#64748b' }
    };

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
                processCharts(jsonData);
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred while loading data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processCharts = (items: CandidateData[]) => {
        // Process Locations
        const locMap: Record<string, number> = {};
        const locationSynonyms: Record<string, string> = {
            'bengaluru': 'Bangalore',
            'gurugram': 'Gurgaon',
            'bombay': 'Mumbai',
            'calcutta': 'Kolkata',
            'madras': 'Chennai',
            'new delhi': 'Delhi',
            'delhi ncr': 'Delhi'
        };

        items.forEach(item => {
            let rawLoc = item.Location?.toString().trim();
            let loc = 'Unknown';

            if (rawLoc && rawLoc.toLowerCase() !== 'nan' && rawLoc.toLowerCase() !== 'null') {
                // Heuristic: Split by common delimiters and take the first part (City)
                let firstPart = rawLoc.split(/[,/\-–()]/)[0].trim();

                // Aggressive cleanup: remove digits and special chars
                let clean = firstPart.replace(/[^a-zA-Z\s]/g, ' ').trim().toLowerCase();

                // Handle synonyms
                if (locationSynonyms[clean]) {
                    clean = locationSynonyms[clean].toLowerCase();
                }

                if (clean.length >= 2) {
                    loc = clean.replace(/\b\w/g, c => c.toUpperCase());
                }
            }
            locMap[loc] = (locMap[loc] || 0) + 1;
        });

        const locChart = Object.entries(locMap)
            .map(([name, count]) => ({ name, count }))
            .filter(item => item.name !== 'Unknown')
            .sort((a, b) => b.count - a.count);

        setAllLocationData(locChart);

        // Process Skills
        const skillMap: Record<string, number> = {};
        items.forEach(item => {
            if (item.skills) {
                // Split by comma, maybe semicolon too if needed, and trim
                const skills = item.skills.split(',').map(s => s.trim());
                skills.forEach(skill => {
                    if (skill) {
                        skillMap[skill] = (skillMap[skill] || 0) + 1;
                    }
                });
            }
        });

        const skillChart = Object.entries(skillMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        setAllSkillsData(skillChart);

        // Process Clients
        const clientMap: Record<string, number> = {};
        items.forEach(item => {
            const client = item.client?.trim() || 'Unknown';
            clientMap[client] = (clientMap[client] || 0) + 1;
        });

        const clientChart = Object.entries(clientMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        setAllClientData(clientChart);

        // Process Roles
        const roleMap: Record<string, number> = {};
        items.forEach(item => {
            const role = item.roleDesignation?.trim() || 'Unknown';
            roleMap[role] = (roleMap[role] || 0) + 1;
        });

        const roleChart = Object.entries(roleMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        setAllRoleData(roleChart);

        // Process Verticals (Industry Type)
        const verticalMap: Record<string, number> = {};
        items.forEach(item => {
            const vertical = item.vertical?.trim() || 'Unknown';
            verticalMap[vertical] = (verticalMap[vertical] || 0) + 1;
        });

        const verticalChart = Object.entries(verticalMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        setAllVerticalData(verticalChart);

        // Process Department Types (Domain)
        const deptTypeMap: Record<string, number> = {};
        items.forEach(item => {
            const deptType = item['department type']?.trim() || 'Unknown';
            deptTypeMap[deptType] = (deptTypeMap[deptType] || 0) + 1;
        });

        const deptTypeChart = Object.entries(deptTypeMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        setAllDepartmentTypeData(deptTypeChart);
    };

    // Derived State
    const displayedClients = selectedClients.length === 0
        ? allClientData.slice(0, 5)
        : allClientData.filter(c => selectedClients.includes(c.name));

    const toggleClientSelection = (clientName: string) => {
        setSelectedClients(prev => {
            if (prev.includes(clientName)) {
                return prev.filter(c => c !== clientName);
            } else {
                return [...prev, clientName];
            }
        });
    };

    const displayedRoles = selectedRoles.length === 0
        ? allRoleData.slice(0, 5)
        : allRoleData.filter(r => selectedRoles.includes(r.name));

    const toggleRoleSelection = (roleName: string) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleName)) {
                return prev.filter(r => r !== roleName);
            } else {
                return [...prev, roleName];
            }
        });
    };

    const displayedLocations = selectedLocations.length === 0
        ? allLocationData.slice(0, 5)
        : allLocationData.filter(l => selectedLocations.includes(l.name));

    const toggleLocationSelection = (locName: string) => {
        setSelectedLocations(prev => {
            if (prev.includes(locName)) {
                return prev.filter(l => l !== locName);
            } else {
                return [...prev, locName];
            }
        });
    };

    const displayedSkills = selectedSkills.length === 0
        ? allSkillsData.slice(0, 5)
        : allSkillsData.filter(s => selectedSkills.includes(s.name));

    const toggleSkillSelection = (skillName: string) => {
        setSelectedSkills(prev => {
            if (prev.includes(skillName)) {
                return prev.filter(s => s !== skillName);
            } else {
                return [...prev, skillName];
            }
        });
    };

    const displayedVerticals = selectedVerticals.length === 0
        ? allVerticalData.slice(0, 5)
        : allVerticalData.filter(v => selectedVerticals.includes(v.name));

    const toggleVerticalSelection = (verticalName: string) => {
        setSelectedVerticals(prev => {
            if (prev.includes(verticalName)) {
                return prev.filter(v => v !== verticalName);
            } else {
                return [...prev, verticalName];
            }
        });
    };

    const displayedDepartmentTypes = allDepartmentTypeData;

    // Metrics
    const totalCandidates = data.length;
    const uniqueLocations = allLocationData.length;
    const uniqueSkills = allSkillsData.length;

    if (loading && data.length === 0) {
        // Allow rendering even if loading, handled by internal spinners
    }

    if (error) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
            <h2>Error Loading Data</h2>
            <p>{error}</p>
        </div>
    );

    const renderFilterDropdown = (
        label: string,
        data: ChartData[],
        selected: string[],
        toggleSelection: (name: string) => void,
        resetSelection: () => void,
        search: string,
        setSearch: (s: string) => void,
        isOpen: boolean,
        setIsOpen: (o: boolean) => void
    ) => (
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    {selected.length > 0 && (
                        <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '999px',
                            minWidth: '1.2rem',
                            textAlign: 'center'
                        }}>
                            {selected.length}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '0.75rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    marginBottom: '1rem',
                    background: isDarkMode ? '#1e293b' : '#ffffff',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    zIndex: 1000,
                    width: '100%',
                    minWidth: '200px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>
                        <input
                            type="text"
                            placeholder={`Search ${label}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--card-border)',
                                background: isDarkMode ? '#0f172a' : '#f1f5f9',
                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--card-border)',
                        marginBottom: '0.25rem',
                        fontSize: '0.75rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: 500
                    }}
                        onClick={() => {
                            resetSelection();
                            setSearch('');
                            setIsOpen(false);
                        }}
                    >
                        Clear Filters
                    </div>
                    {data.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                        <div
                            key={item.name}
                            onClick={() => toggleSelection(item.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                fontSize: '0.875rem',
                                borderRadius: '6px',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(item.name)}
                                readOnly
                                style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                            />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                {item.name || 'Unknown'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.count}</span>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: '1rem', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={j2wLogo} alt="J2W Logo" style={{ height: '40px', width: 'auto', marginRight: '0.5rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                        Talent Landscape
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/candidate-details')}
                        style={{
                            background: 'linear-gradient(135deg, #1D4ED8 0%, #0D9488 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '1.0rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Candidate Details
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

            {/* Global Filter Bar */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', width: '100%', position: 'relative', zIndex: 50, overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginRight: '0.5rem' }}>
                    <Search size={16} />
                    <span>FILTERS:</span>
                </div>
                {renderFilterDropdown('Clients', allClientData, selectedClients, toggleClientSelection, () => setSelectedClients([]), clientSearch, setClientSearch, activeDropdown === 'Clients', (isOpen) => setActiveDropdown(isOpen ? 'Clients' : null))}
                {renderFilterDropdown('Roles', allRoleData, selectedRoles, toggleRoleSelection, () => setSelectedRoles([]), roleSearch, setRoleSearch, activeDropdown === 'Roles', (isOpen) => setActiveDropdown(isOpen ? 'Roles' : null))}
                {renderFilterDropdown('Locations', allLocationData, selectedLocations, toggleLocationSelection, () => setSelectedLocations([]), locationSearch, setLocationSearch, activeDropdown === 'Locations', (isOpen) => setActiveDropdown(isOpen ? 'Locations' : null))}
                {renderFilterDropdown('Skills', allSkillsData, selectedSkills, toggleSkillSelection, () => setSelectedSkills([]), skillSearch, setSkillSearch, activeDropdown === 'Skills', (isOpen) => setActiveDropdown(isOpen ? 'Skills' : null))}
                {renderFilterDropdown('Industry', allVerticalData, selectedVerticals, toggleVerticalSelection, () => setSelectedVerticals([]), verticalSearch, setVerticalSearch, activeDropdown === 'Industry', (isOpen) => setActiveDropdown(isOpen ? 'Industry' : null))}
            </div>

            {/* Metrics Cards */}
            <style>{styles}</style>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '2rem', gap: '1.5rem' }}>
                {/* Total Candidates */}
                <div className="metric-card">
                    <div className="metric-content">
                        <span className="metric-label">No Of Samples</span>
                        <div className="metric-value">{totalCandidates}</div>
                    </div>
                    <div className="metric-icon-container" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)', color: '#3b82f6' }}>
                        <Users size={28} strokeWidth={2} />
                    </div>
                </div>

                {/* Unique Locations */}
                <div className="metric-card">
                    <div className="metric-content">
                        <span className="metric-label">Unique Locations</span>
                        <div className="metric-value">{uniqueLocations}</div>
                    </div>
                    <div className="metric-icon-container" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(167, 139, 250, 0.05) 100%)', color: '#a78bfa' }}>
                        <MapPin size={28} strokeWidth={2} />
                    </div>
                </div>

                {/* Unique Skills */}
                <div className="metric-card">
                    <div className="metric-content">
                        <span className="metric-label">Unique Skills</span>
                        <div className="metric-value">{uniqueSkills}</div>
                    </div>
                    <div className="metric-icon-container" style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.05) 100%)', color: '#34d399' }}>
                        <Code size={28} strokeWidth={2} />
                    </div>
                </div>

                {/* Unique Roles */}
                <div className="metric-card">
                    <div className="metric-content">
                        <span className="metric-label">Unique Roles</span>
                        <div className="metric-value">{allRoleData.length}</div>
                    </div>
                    <div className="metric-icon-container" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.05) 100%)', color: '#fbbf24' }}>
                        <Briefcase size={28} strokeWidth={2} />
                    </div>
                </div>

                {/* Unique Clients */}
                <div className="metric-card">
                    <div className="metric-content">
                        <span className="metric-label">Unique Clients</span>
                        <div className="metric-value">{allClientData.length}</div>
                    </div>
                    <div className="metric-icon-container" style={{ background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.05) 100%)', color: '#f43f5e' }}>
                        <Building size={28} strokeWidth={2} />
                    </div>
                </div>
            </div>


            <div className="dashboard-grid">
                {/* Client Chart */}
                <div className="glass-card">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Clients</h2>
                            <InfoTooltip text="Candidates grouped by their associated client companies." />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Displaying top 5 clients by default</p>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedClients} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={true} vertical={true} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]}>
                                    {displayedClients.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 1) % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Role Chart */}
                <div className="glass-card">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Roles</h2>
                            <InfoTooltip text="Distribution of candidates across different job designations." />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Displaying top 5 roles by default</p>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayedRoles}
                                    cx="35%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#f472b6"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {displayedRoles.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                />
                                <Legend
                                    iconType="circle"
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ width: '30%', lineHeight: '24px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Location Chart */}
                <div className="glass-card">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Locations</h2>
                            <InfoTooltip text="Locations with the highest number of candidates." />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Displaying top 5 locations by default</p>
                    </div>
                    <div className="chart-container" style={{ position: 'relative' }}>
                        {loading ? (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)', zIndex: 10
                            }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : null}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedLocations} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={true} vertical={true} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {displayedLocations.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Chart */}
                <div className="glass-card">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Skills</h2>
                            <InfoTooltip text="Most frequent skills listed by candidates." />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Displaying top 5 skills by default</p>
                    </div>
                    <div className="chart-container" style={{ position: 'relative' }}>
                        {loading ? (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)', zIndex: 10
                            }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : null}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedSkills} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={true} vertical={true} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]}>
                                    {displayedSkills.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Industry Breakdown (Vertical) Chart */}
                <div className="glass-card">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Industry Breakdown</h2>
                            <InfoTooltip text="Candidates categorized by industry verticals." />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Displaying top 5 industries by default</p>
                    </div>
                    <div className="chart-container" style={{ position: 'relative' }}>
                        {loading ? (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)', zIndex: 10
                            }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : null}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedVerticals} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={true} vertical={true} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#60a5fa" radius={[0, 4, 4, 0]}>
                                    {displayedVerticals.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 4) % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Domain (Department Type) Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Domain Distribution</h2>
                            <InfoTooltip text="Overview of candidates across different business domains." />
                        </div>
                    </div>
                    <div className="chart-container" style={{ position: 'relative' }}>
                        {loading ? (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)', zIndex: 10
                            }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : null}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayedDepartmentTypes}
                                    cx="35%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {displayedDepartmentTypes.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 5) % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ width: '30%', right: 0 }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>



            {/* Data Table */}
            {/* <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Candidate Details</h2>
                <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Location</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Role</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Industry Type</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Domain</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Experience</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Skills</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, i) => (
                                <tr
                                    key={i}
                                    onClick={() => {
                                        setSelectedCandidate(row);
                                        setIsModalOpen(true);
                                    }}
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        // Hover effect is handled by CSS usually, but we can do inline style trick or class
                                        // We'll rely on a class "table-row-hover" if it exists, or just basic transform
                                    }}
                                    className="table-row-hover"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.9)';
                                        e.currentTarget.style.transform = 'scale(1.002)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <td style={{ padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>{row['Employee ID']}</td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{row['Candidate Name']}</td>
                                    <td style={{ padding: '1rem' }}>{row['Location']}</td>
                                    <td style={{ padding: '1rem' }}>{row['roleDesignation']}</td>
                                    <td style={{ padding: '1rem' }}>{row['vertical']}</td>
                                    <td style={{ padding: '1rem' }}>{row['department type']}</td>
                                    <td style={{ padding: '1rem' }}>{row['experienceYears']}</td>
                                    <td style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', maxWidth: '300px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {row.skills ? row.skills.split(',').map((skill, idx) => (
                                                <span key={idx} style={{
                                                    display: 'inline-block',
                                                    backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                                                    color: isDarkMode ? '#60a5fa' : '#2563eb',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500
                                                }}>
                                                    {skill.trim()}
                                                </span>
                                            )) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 1rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCandidates)} of {totalCandidates} entries
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                                background: currentPage === 1
                                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
                                    : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                                color: currentPage === 1
                                    ? (isDarkMode ? '#64748b' : '#94a3b8')
                                    : (isDarkMode ? '#fff' : '#1e293b'),
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Previous
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) {
                                        pageNum = totalPages - (4 - i);
                                    }
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: '1px solid ' + (currentPage === pageNum ? '#3b82f6' : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')),
                                            background: currentPage === pageNum ? '#3b82f6' : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                                            color: currentPage === pageNum ? '#fff' : (isDarkMode ? '#fff' : '#1e293b'),
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                                background: currentPage === totalPages
                                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
                                    : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                                color: currentPage === totalPages
                                    ? (isDarkMode ? '#64748b' : '#94a3b8')
                                    : (isDarkMode ? '#fff' : '#1e293b'),
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div> */}
            {/* AI Chatbot */}
            <DashboardChatbot data={data} />
        </div >
    );
}
