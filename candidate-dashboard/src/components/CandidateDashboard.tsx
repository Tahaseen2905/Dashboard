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
import { Users, MapPin, Code, Activity } from 'lucide-react';

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

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#f87171'];

export default function CandidateDashboard() {
    const [data, setData] = useState<CandidateData[]>([]);
    const [allLocationData, setAllLocationData] = useState<ChartData[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

    const [allSkillsData, setAllSkillsData] = useState<ChartData[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

    const [allClientData, setAllClientData] = useState<ChartData[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allRoleData, setAllRoleData] = useState<ChartData[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    const [allVerticalData, setAllVerticalData] = useState<ChartData[]>([]);
    const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
    const [isVerticalDropdownOpen, setIsVerticalDropdownOpen] = useState(false);

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
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        grid: { stroke: isDarkMode ? '#334155' : '#e2e8f0' },
        axis: { stroke: isDarkMode ? '#94a3b8' : '#64748b' }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/candidate_data.xlsx');
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
        items.forEach(item => {
            const loc = item.Location?.trim() || 'Unknown';
            locMap[loc] = (locMap[loc] || 0) + 1;
        });

        const locChart = Object.entries(locMap)
            .map(([name, count]) => ({ name, count }))
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

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCandidates / itemsPerPage);

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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                    Candidate Dashboard
                </h1>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--card-border)',
                        color: 'var(--text-color)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>

            {/* Metrics Cards */}
            <style>{styles}</style>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Candidates</p>
                        <div className="stat-value">{totalCandidates}</div>
                    </div>
                    <div className="icon-wrapper" style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Users size={24} />
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Unique Locations</p>
                        <div className="stat-value">{uniqueLocations}</div>
                    </div>
                    <div className="icon-wrapper" style={{
                        background: 'rgba(167, 139, 250, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        color: '#a78bfa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MapPin size={24} />
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Unique Skills</p>
                        <div className="stat-value">{uniqueSkills}</div>
                    </div>
                    <div className="icon-wrapper" style={{
                        background: 'rgba(52, 211, 153, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Code size={24} />
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Processing Status</p>
                        <div className="stat-value" style={{ fontSize: '1.5rem', color: '#34d399', WebkitTextFillColor: '#34d399' }}>Active</div>
                    </div>
                    <div className="icon-wrapper" style={{
                        background: 'rgba(244, 114, 182, 0.1)',
                        padding: '1rem',
                        borderRadius: '50%',
                        color: '#f472b6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Activity size={24} />
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Client Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Clients</h2>

                        {/* Custom Multi-Select Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {selectedClients.length === 0 ? 'Top 5 (Default)' : `${selectedClients.length} Selected`}
                                <span style={{ fontSize: '0.75rem' }}>▼</span>
                            </button>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    width: '200px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                        onClick={() => {
                                            setSelectedClients([]);
                                            setClientSearch('');
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        Reset to Top 5
                                    </div>
                                    <div style={{ padding: '0.5rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                                        <input
                                            type="text"
                                            placeholder="Search Clients..."
                                            value={clientSearch}
                                            onChange={(e) => setClientSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                                                background: isDarkMode ? '#0f172a' : '#ffffff',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {allClientData.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(client => (
                                        <div
                                            key={client.name}
                                            onClick={() => toggleClientSelection(client.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.25rem',
                                                cursor: 'pointer',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.includes(client.name)}
                                                readOnly
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {client.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedClients} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={false} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]}>
                                    {displayedClients.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Role Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Roles</h2>

                        {/* Custom Multi-Select Dropdown for Roles */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                style={{
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {selectedRoles.length === 0 ? 'Top 5 (Default)' : `${selectedRoles.length} Selected`}
                                <span style={{ fontSize: '0.75rem' }}>▼</span>
                            </button>

                            {isRoleDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    width: '200px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                        onClick={() => {
                                            setSelectedRoles([]);
                                            setRoleSearch('');
                                            setIsRoleDropdownOpen(false);
                                        }}
                                    >
                                        Reset to Top 5
                                    </div>
                                    <div style={{ padding: '0.5rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                                        <input
                                            type="text"
                                            placeholder="Search Roles..."
                                            value={roleSearch}
                                            onChange={(e) => setRoleSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                                                background: isDarkMode ? '#0f172a' : '#ffffff',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {allRoleData.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase())).map(role => (
                                        <div
                                            key={role.name}
                                            onClick={() => toggleRoleSelection(role.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.25rem',
                                                cursor: 'pointer',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.includes(role.name)}
                                                readOnly
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {role.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayedRoles}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#f472b6"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {displayedRoles.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Location Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Locations</h2>

                        {/* Custom Multi-Select Dropdown for Locations */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                                style={{
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {selectedLocations.length === 0 ? 'Top 5 (Default)' : `${selectedLocations.length} Selected`}
                                <span style={{ fontSize: '0.75rem' }}>▼</span>
                            </button>

                            {isLocationDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    width: '200px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                        onClick={() => {
                                            setSelectedLocations([]);
                                            setLocationSearch('');
                                            setIsLocationDropdownOpen(false);
                                        }}
                                    >
                                        Reset to Top 5
                                    </div>
                                    <div style={{ padding: '0.5rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                                        <input
                                            type="text"
                                            placeholder="Search Locations..."
                                            value={locationSearch}
                                            onChange={(e) => setLocationSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                                                background: isDarkMode ? '#0f172a' : '#ffffff',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {allLocationData.filter(l => l.name.toLowerCase().includes(locationSearch.toLowerCase())).map(loc => (
                                        <div
                                            key={loc.name}
                                            onClick={() => toggleLocationSelection(loc.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.25rem',
                                                cursor: 'pointer',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedLocations.includes(loc.name)}
                                                readOnly
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {loc.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedLocations} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={false} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {displayedLocations.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Skills</h2>

                        {/* Custom Multi-Select Dropdown for Skills */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                                style={{
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {selectedSkills.length === 0 ? 'Top 5 (Default)' : `${selectedSkills.length} Selected`}
                                <span style={{ fontSize: '0.75rem' }}>▼</span>
                            </button>

                            {isSkillDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    width: '200px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                        onClick={() => {
                                            setSelectedSkills([]);
                                            setSkillSearch('');
                                            setIsSkillDropdownOpen(false);
                                        }}
                                    >
                                        Reset to Top 5
                                    </div>
                                    <div style={{ padding: '0.5rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                                        <input
                                            type="text"
                                            placeholder="Search Skills..."
                                            value={skillSearch}
                                            onChange={(e) => setSkillSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                                                background: isDarkMode ? '#0f172a' : '#ffffff',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {allSkillsData.filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase())).map(skill => (
                                        <div
                                            key={skill.name}
                                            onClick={() => toggleSkillSelection(skill.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.25rem',
                                                cursor: 'pointer',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSkills.includes(skill.name)}
                                                readOnly
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {skill.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedSkills} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={false} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]}>
                                    {displayedSkills.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Industry (Vertical) Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Industry Breakdown</h2>

                        {/* Custom Multi-Select Dropdown for Vertical */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsVerticalDropdownOpen(!isVerticalDropdownOpen)}
                                style={{
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {selectedVerticals.length === 0 ? 'Top 5 (Default)' : `${selectedVerticals.length} Selected`}
                                <span style={{ fontSize: '0.75rem' }}>▼</span>
                            </button>

                            {isVerticalDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: isDarkMode ? '#1e293b' : '#ffffff',
                                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    width: '200px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                        onClick={() => {
                                            setSelectedVerticals([]);
                                            setVerticalSearch('');
                                            setIsVerticalDropdownOpen(false);
                                        }}
                                    >
                                        Reset to Top 5
                                    </div>
                                    <div style={{ padding: '0.5rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                                        <input
                                            type="text"
                                            placeholder="Search Industries..."
                                            value={verticalSearch}
                                            onChange={(e) => setVerticalSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                                                background: isDarkMode ? '#0f172a' : '#ffffff',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {allVerticalData.filter(v => v.name.toLowerCase().includes(verticalSearch.toLowerCase())).map(v => (
                                        <div
                                            key={v.name}
                                            onClick={() => toggleVerticalSelection(v.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.25rem',
                                                cursor: 'pointer',
                                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedVerticals.includes(v.name)}
                                                readOnly
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {v.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayedVerticals} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} horizontal={false} />
                                <XAxis type="number" stroke={chartStyles.axis.stroke} />
                                <YAxis dataKey="name" type="category" stroke={chartStyles.axis.stroke} width={100} />
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                    cursor={chartStyles.cursor}
                                />
                                <Bar dataKey="count" fill="#60a5fa" radius={[0, 4, 4, 0]}>
                                    {displayedVerticals.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Domain (Department Type) Chart */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Domain Distribution</h2>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayedDepartmentTypes}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {displayedDepartmentTypes.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={chartStyles.contentStyle}
                                    itemStyle={chartStyles.itemStyle}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Candidate Details Modal */}
            {isModalOpen && selectedCandidate && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setIsModalOpen(false)}>
                    <div style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '2rem',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: isDarkMode ? '#94a3b8' : '#64748b',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>

                        <h2 style={{
                            marginTop: 0,
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem',
                            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                            paddingBottom: '1rem'
                        }}>
                            Candidate Details
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {Object.entries(selectedCandidate).map(([key, value]) => {
                                // Skip internal/complex objects if any, keep simple values
                                if (typeof value === 'object' && value !== null) return null;
                                return (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: isDarkMode ? '#94a3b8' : '#64748b',
                                            fontWeight: 600
                                        }}>
                                            {key}
                                        </span>
                                        <span style={{
                                            fontSize: '1rem',
                                            color: isDarkMode ? '#f8fafc' : '#1e293b'
                                        }}>
                                            {String(value || 'N/A')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="glass-card" style={{ marginTop: '2rem' }}>
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

                {/* Pagination Controls */}
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
            </div>
        </div>
    );
}
