import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { supabase } from '../lib/supabase'

interface Business {
  id: string;
  name: string;
  phone: string;
  address: string;
  website?: string;
  called?: boolean;
  notes?: string;
  contact_info?: any;
  specialty?: string;
}

const Home: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'civil' | 'general' | 'home'>('civil');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = {
    civil: "Civil Contractors",
    general: "General Contractors", 
    home: "Home Builders",
  };

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, phone, address, website, called, notes, contact_info, specialty')
        .eq('category', activeTab);

      if (error) {
        console.error('Error fetching businesses:', error);
      } else {
        setBusinesses(data || []);
      }
      setLoading(false);
    }
    fetchBusinesses();
  }, [activeTab]);

  const filteredBusinesses = businesses.filter((business: Business) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCalledChange = async (id: string, called: boolean) => {
    const { data, error } = await supabase
      .from('businesses')
      .update({ called: !called })
      .eq('id', id);

    if (error) {
      console.error('Error updating business:', error);
    } else {
      setBusinesses(businesses.map(business =>
        business.id === id ? { ...business, called: !called } : business
      ));
    }
  };

  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [localContactInfo, setLocalContactInfo] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialNotes: Record<string, string> = {};
    const initialContactInfo: Record<string, any> = {};
    businesses.forEach(business => {
      initialNotes[business.id] = business.notes || '';
      initialContactInfo[business.id] = business.contact_info || '';
    });
    setLocalNotes(initialNotes);
    setLocalContactInfo(initialContactInfo);
  }, [businesses]);

  const handleSave = async (id: string, field: 'notes' | 'contact_info', value: any) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('businesses')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error('Error updating business:', error);
    } else {
      setBusinesses(businesses.map(business =>
        business.id === id ? { ...business, [field]: value } : business
      ));
    }
    setIsSaving(false);
  };

  const handleNotesChange = (id: string, notes: string) => {
    setLocalNotes(prev => ({ ...prev, [id]: notes }));
  };

  const handleContactInfoChange = (id: string, contact_info: any) => {
    setLocalContactInfo(prev => ({ ...prev, [id]: contact_info }));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Victoria BC Contractors Directory</title>
        <meta name="description" content="Directory of contractors in Victoria BC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Victoria BC Contractors Directory
        </h1>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tabs}>
          <button 
            onClick={() => setActiveTab('civil')}
            className={activeTab === 'civil' ? styles.activeTab : styles.tab}
          >
            Civil Contractors
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={activeTab === 'general' ? styles.activeTab : styles.tab}
          >
            General Contractors
          </button>
          <button 
            onClick={() => setActiveTab('home')}
            className={activeTab === 'home' ? styles.activeTab : styles.tab}
          >
            Home Builders
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.contractorTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Called</th>
                <th>Notes</th>
                <th>Contact Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((business: Business, index: number) => (
                <tr key={index}>
                  <td data-label="Name">{business.website ? (
                    <a href={business.website} target="_blank" rel="noopener noreferrer">{business.name}</a>
                  ) : (
                    <span>{business.name}</span>
                  )}</td>
                  <td data-label="Phone">
                    {business.phone ? (
                      <a href={`tel:${business.phone}`}>{business.phone}</a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td data-label="Address">{business.address}</td>
                  <td data-label="Called">
                    <input
                      type="checkbox"
                      checked={business.called ?? false}
                      onChange={() => handleCalledChange(business.id, business.called ?? false)}
                    />
                  </td>
                  <td data-label="Notes">
                    <div className={styles.inputContainer}>
                      <textarea
                        value={localNotes[business.id] ?? ''}
                        onChange={(e) => handleNotesChange(business.id, e.target.value)}
                        onBlur={(e) => handleSave(business.id, 'notes', e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                  </td>
                  <td data-label="Contact Info">
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        value={localContactInfo[business.id] ?? ''}
                        onChange={(e) => handleContactInfoChange(business.id, e.target.value)}
                        onBlur={(e) => handleSave(business.id, 'contact_info', e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                  </td>
                  <td data-label="Specialty">
                    {business.specialty || 'Not specified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Contractors and builders in Victoria</p>
      </footer>
    </div>
  )
}

export default Home
