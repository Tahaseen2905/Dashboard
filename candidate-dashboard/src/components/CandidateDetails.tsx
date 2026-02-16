import { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search, Sun, Moon, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import j2wLogo from '../assets/j2w.svg';
import CandidateProfileModal from './CandidateProfileModal';
import DashboardChatbot from './DashboardChatbot';

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

interface FilterOption {
    name: string;
    count: number;
}

export default function CandidateDetails() {
    const [data, setData] = useState<CandidateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Filter States
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedITNonIT, setSelectedITNonIT] = useState<string[]>([]);

    // Dropdown UI States
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [tempSelectedItems, setTempSelectedItems] = useState<string[]>([]); // Current selection in open dropdown

    // Search States for Dropdowns
    const [companySearch, setCompanySearch] = useState('');
    const [roleSearch, setRoleSearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [skillSearch, setSkillSearch] = useState('');
    const [domainSearch, setDomainSearch] = useState('');
    const [itNonItSearch, setItNonItSearch] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);



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
                const response = await fetch(`/final_excel.xlsx?v=${Date.now()}`);
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

    // Filter Logic Helpers
    const processData = (items: CandidateData[]) => {
        // Helper to count and sort
        const getCounts = (key: string, split = false) => {
            const map: Record<string, number> = {};
            const skillNorm: Record<string, string> = {
                'react js': 'React.js',
                'reactjs': 'React.js',
                'react.js': 'React.js',
                'react': 'React.js',
                'react. js': 'React.js',
                'react  js': 'React.js'
            };

            items.forEach(item => {
                const val = item[key];
                if (val) {
                    if (split) {
                        const uniqueItemValues = new Set<string>();
                        val.toString().split(/[,;]/).forEach((s: string) => {
                            const trimmed = s.trim();
                            if (trimmed) {
                                const normValue = key === 'skill' ? (skillNorm[trimmed.toLowerCase().replace(/\s+/g, ' ')] || trimmed) : trimmed;
                                uniqueItemValues.add(normValue);
                            }
                        });
                        uniqueItemValues.forEach(v => {
                            map[v] = (map[v] || 0) + 1;
                        });
                    } else {
                        const trimmed = val.toString().trim();
                        if (trimmed) map[trimmed] = (map[trimmed] || 0) + 1;
                    }
                }
            });
            return Object.entries(map)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);
        };

        return {
            locations: getCounts('candidate_city'),
            skills: getCounts('skill', true),
            companies: getCounts('company_name'),
            roles: getCounts('designation'),
            domains: getCounts('Domain'),
            itNonIt: getCounts('IT/Non IT')
        };
    };

    const masterFilterOptions = useMemo(() => processData(data), [data]);

    const filteredData = useMemo(() => {
        const skillNorm: Record<string, string> = {
            'react js': 'React.js',
            'reactjs': 'React.js',
            'react.js': 'React.js',
            'react': 'React.js',
            'react. js': 'React.js',
            'react  js': 'React.js'
        };

        return data.filter(item => {
            if (selectedCompanies.length > 0 && !selectedCompanies.includes(item.company_name?.trim())) return false;
            if (selectedRoles.length > 0 && !selectedRoles.includes(item.designation?.trim())) return false;
            if (selectedLocations.length > 0 && !selectedLocations.includes(item.candidate_city?.trim())) return false;
            if (selectedDomains.length > 0 && !selectedDomains.includes(item.Domain?.trim())) return false;
            if (selectedITNonIT.length > 0 && !selectedITNonIT.includes(item['IT/Non IT']?.trim())) return false;

            if (selectedSkills.length > 0) {
                if (!item.skill) return false;
                const itemSkills = item.skill.split(/[,;]/).map((s: string) => {
                    const trimmed = s.trim();
                    return skillNorm[trimmed.toLowerCase().replace(/\s+/g, ' ')] || trimmed;
                });
                if (!itemSkills.some((s: string) => selectedSkills.includes(s))) return false;
            }

            return true;
        });
    }, [data, selectedCompanies, selectedRoles, selectedLocations, selectedDomains, selectedITNonIT, selectedSkills]);

    // Pagination Logic (Uses filteredData now)
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Filter Handlers
    const handleOpenDropdown = (dropdown: string, currentSelection: string[]) => {
        if (activeDropdown === dropdown) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(dropdown);
            setTempSelectedItems([...currentSelection]);
        }
    };

    const handleToggleTempSelection = (item: string) => {
        setTempSelectedItems(prev => {
            if (prev.includes(item)) return prev.filter(i => i !== item);
            return [...prev, item];
        });
    };

    const handleApplyFilter = (dropdown: string) => {
        switch (dropdown) {
            case 'Companies': setSelectedCompanies(tempSelectedItems); break;
            case 'Roles': setSelectedRoles(tempSelectedItems); break;
            case 'Locations': setSelectedLocations(tempSelectedItems); break;
            case 'Skills': setSelectedSkills(tempSelectedItems); break;
            case 'Domain': setSelectedDomains(tempSelectedItems); break;
            case 'IT/Non IT': setSelectedITNonIT(tempSelectedItems); break;
        }
        setActiveDropdown(null);
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    const handleClearFilter = (dropdown: string) => {
        switch (dropdown) {
            case 'Companies': setSelectedCompanies([]); break;
            case 'Roles': setSelectedRoles([]); break;
            case 'Locations': setSelectedLocations([]); break;
            case 'Skills': setSelectedSkills([]); break;
            case 'Domain': setSelectedDomains([]); break;
            case 'IT/Non IT': setSelectedITNonIT([]); break;
        }
        setActiveDropdown(null);
        setCurrentPage(1);
    };

    const handleGlobalClear = () => {
        setSelectedCompanies([]);
        setSelectedRoles([]);
        setSelectedLocations([]);
        setSelectedSkills([]);
        setSelectedDomains([]);
        setSelectedITNonIT([]);
        setActiveDropdown(null);
        setCurrentPage(1);
    };

    const renderFilterDropdown = (
        label: string,
        data: FilterOption[],
        selected: string[],
        search: string,
        setSearch: (s: string) => void,
        dropdownKey: string
    ) => {
        const isOpen = activeDropdown === dropdownKey;

        return (
            <div style={{ position: 'relative', minWidth: '160px', flex: 1 }}>
                <button
                    onClick={() => handleOpenDropdown(dropdownKey, selected)}
                    style={{
                        background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        border: '1px solid var(--card-border)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.8rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
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
                        background: isDarkMode ? '#1e293b' : '#ffffff',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        zIndex: 1000,
                        width: '240px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        maxHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column'
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

                        <div style={{ overflowY: 'auto', flex: 1, maxHeight: '250px' }}>
                            {data.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                                <div
                                    key={item.name}
                                    onClick={() => handleToggleTempSelection(item.name)}
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
                                        checked={tempSelectedItems.includes(item.name)}
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

                        <div style={{
                            padding: '0.75rem 0.5rem 0.25rem 0.5rem',
                            borderTop: '1px solid var(--card-border)',
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'space-between'
                        }}>
                            <button
                                onClick={() => handleClearFilter(dropdownKey)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--card-border)',
                                    background: 'transparent',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setActiveDropdown(null)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--card-border)',
                                    background: 'transparent',
                                    color: isDarkMode ? '#94a3b8' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApplyFilter(dropdownKey)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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

                {/* Filter Bar */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginRight: '0.5rem' }}>
                        <Search size={16} />
                        <span>FILTERS:</span>
                    </div>
                    {renderFilterDropdown('Companies', masterFilterOptions.companies, selectedCompanies, companySearch, setCompanySearch, 'Companies')}
                    {renderFilterDropdown('Roles', masterFilterOptions.roles, selectedRoles, roleSearch, setRoleSearch, 'Roles')}
                    {renderFilterDropdown('Locations', masterFilterOptions.locations, selectedLocations, locationSearch, setLocationSearch, 'Locations')}
                    {renderFilterDropdown('Skills', masterFilterOptions.skills, selectedSkills, skillSearch, setSkillSearch, 'Skills')}
                    {renderFilterDropdown('Domain', masterFilterOptions.domains, selectedDomains, domainSearch, setDomainSearch, 'Domain')}
                    {renderFilterDropdown('IT/Non IT', masterFilterOptions.itNonIt, selectedITNonIT, itNonItSearch, setItNonItSearch, 'IT/Non IT')}

                    <button
                        onClick={handleGlobalClear}
                        style={{
                            marginLeft: 'auto',
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        Clear All
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Role</th>
                                <th>Company</th>
                                <th>Skills</th>
                                <th>Domain</th>
                                <th>IT/Non IT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((candidate, index) => (
                                <tr key={index}>
                                    <td style={{ fontWeight: 500 }}>{candidate['employee_id'] || '-'}</td>
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
                                                {candidate['full_name']?.charAt(0) || 'U'}
                                            </div>
                                            <span style={{ fontWeight: 600, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                                {candidate['full_name'] || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{candidate['candidate_city'] || '-'}</td>
                                    <td>
                                        <span style={{
                                            background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#e0f2fe',
                                            color: isDarkMode ? '#60a5fa' : '#0369a1',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {candidate['designation'] || '-'}
                                        </span>
                                    </td>
                                    <td>{candidate['company_name'] || '-'}</td>

                                    <td>
                                        {candidate['skill'] ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                {candidate['skill']?.split(/[,;]/).slice(0, 3).map((skill, i) => (
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
                                                {(candidate['skill']?.split(/[,;]/).length || 0) > 3 && (
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        +{(candidate['skill']?.split(/[,;]/).length || 0) - 3}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                    <td>{candidate['Domain'] || '-'}</td>
                                    <td>{candidate['IT/Non IT'] || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--text-color)', opacity: 0.2 }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Showing {filteredData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} candidates
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
