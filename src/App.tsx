import { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, DollarSign, Trash2, ChevronDown, ChevronUp, X, Star, Plane } from 'lucide-react'

const ACCENT = '#F97316'

type ItemType = 'activity' | 'accommodation' | 'transport' | 'food' | 'note'

interface TripItem {
  id: string
  day: number
  type: ItemType
  title: string
  description: string
  time: string
  cost: number
  location: string
  booked: boolean
}

interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  items: TripItem[]
  notes: string
}

const ITEM_TYPES: Record<ItemType, { label: string, color: string, emoji: string }> = {
  activity: { label: 'Activity', color: '#60A5FA', emoji: '🎯' },
  accommodation: { label: 'Hotel', color: '#A78BFA', emoji: '🏨' },
  transport: { label: 'Transport', color: '#FBBF24', emoji: '✈️' },
  food: { label: 'Food', color: '#4ADE80', emoji: '🍽️' },
  note: { label: 'Note', color: '#94A3B8', emoji: '📝' },
}

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 1
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / 86400000) + 1)
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(() => {
    try { return JSON.parse(localStorage.getItem('trip_planner') || '[]') } catch { return [] }
  })
  const [activeId, setActiveId] = useState<string>('')
  const [tab, setTab] = useState<'trips' | 'plan' | 'budget'>('trips')
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [tripForm, setTripForm] = useState({ name: '', destination: '', startDate: '', endDate: '', budget: '' })
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState<{ day: number, type: ItemType, title: string, description: string, time: string, cost: string, location: string, booked: boolean }>({ day: 1, type: 'activity', title: '', description: '', time: '', cost: '', location: '', booked: false })
  const [expandDay, setExpandDay] = useState<number | null>(1)

  useEffect(() => {
    localStorage.setItem('trip_planner', JSON.stringify(trips))
  }, [trips])

  const activeTrip = trips.find(t => t.id === activeId)

  function createTrip() {
    if (!tripForm.name.trim()) return
    const trip: Trip = {
      id: Date.now().toString(),
      name: tripForm.name.trim(),
      destination: tripForm.destination.trim(),
      startDate: tripForm.startDate,
      endDate: tripForm.endDate,
      budget: parseFloat(tripForm.budget) || 0,
      items: [],
      notes: '',
    }
    setTrips(prev => [...prev, trip])
    setActiveId(trip.id)
    setTripForm({ name: '', destination: '', startDate: '', endDate: '', budget: '' })
    setShowNewTrip(false)
    setTab('plan')
  }

  function deleteTrip(id: string) {
    setTrips(prev => prev.filter(t => t.id !== id))
    if (activeId === id) setActiveId('')
  }

  function addItem() {
    if (!itemForm.title.trim() || !activeId) return
    const item: TripItem = {
      id: Date.now().toString(),
      day: itemForm.day,
      type: itemForm.type,
      title: itemForm.title.trim(),
      description: itemForm.description.trim(),
      time: itemForm.time,
      cost: parseFloat(itemForm.cost) || 0,
      location: itemForm.location.trim(),
      booked: itemForm.booked,
    }
    setTrips(prev => prev.map(t => t.id === activeId ? { ...t, items: [...t.items, item] } : t))
    setItemForm(p => ({ ...p, title: '', description: '', time: '', cost: '', location: '', booked: false }))
    setShowAddItem(false)
  }

  function deleteItem(itemId: string) {
    setTrips(prev => prev.map(t => t.id === activeId
      ? { ...t, items: t.items.filter(i => i.id !== itemId) }
      : t))
  }

  function toggleBooked(itemId: string) {
    setTrips(prev => prev.map(t => t.id === activeId
      ? { ...t, items: t.items.map(i => i.id === itemId ? { ...i, booked: !i.booked } : i) }
      : t))
  }

  const totalDays = activeTrip ? daysBetween(activeTrip.startDate, activeTrip.endDate) : 1
  const totalSpent = activeTrip ? activeTrip.items.reduce((s, i) => s + i.cost, 0) : 0
  const budgetLeft = activeTrip ? activeTrip.budget - totalSpent : 0

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0F0A06', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: '#1A1008', padding: '20px 20px 0', borderBottom: '1px solid #2A1A0A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plane size={22} color={ACCENT} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{activeTrip ? activeTrip.name : 'Trip Planner'}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{activeTrip ? activeTrip.destination || 'Offline · No data needed' : 'Pro'}</div>
            </div>
          </div>
          {tab === 'plan' && activeTrip && (
            <button onClick={() => setShowAddItem(true)}
              style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Plus size={15} /> Add
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['trips', 'plan', 'budget'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', color: tab === t ? ACCENT : '#666', fontWeight: tab === t ? 600 : 400, fontSize: 14, borderBottom: `2px solid ${tab === t ? ACCENT : 'transparent'}` }}>
              {t === 'trips' ? 'My Trips' : t === 'plan' ? 'Itinerary' : 'Budget'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
        {tab === 'trips' && (
          <>
            {trips.map(trip => {
              const days = daysBetween(trip.startDate, trip.endDate)
              return (
                <div key={trip.id}
                  style={{ background: '#1A1008', borderRadius: 14, padding: '16px', marginBottom: 10, border: activeId === trip.id ? `1px solid ${ACCENT}` : '1px solid #2A1A0A', cursor: 'pointer' }}
                  onClick={() => { setActiveId(trip.id); setTab('plan') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{trip.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {trip.destination && <><MapPin size={12} color={ACCENT} /><span style={{ fontSize: 13, color: '#888' }}>{trip.destination}</span></>}
                      </div>
                      {trip.startDate && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {days} day{days > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ background: ACCENT + '22', color: ACCENT, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                        {trip.items.length} items
                      </span>
                      <button onClick={e => { e.stopPropagation(); deleteTrip(trip.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444' }}><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              )
            })}

            {trips.length === 0 && !showNewTrip && (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#444' }}>
                <Plane size={48} color="#2A1A0A" style={{ margin: '0 auto 14px' }} />
                <div style={{ marginBottom: 20, fontSize: 14 }}>Plan your next adventure</div>
              </div>
            )}

            {showNewTrip ? (
              <div style={{ background: '#1A1008', borderRadius: 16, padding: 20, border: '1px solid #2A1A0A' }}>
                <input placeholder="Trip name *" value={tripForm.name} onChange={e => setTripForm(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
                <input placeholder="Destination" value={tripForm.destination} onChange={e => setTripForm(p => ({ ...p, destination: e.target.value }))}
                  style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Start date</div>
                    <input type="date" value={tripForm.startDate} onChange={e => setTripForm(p => ({ ...p, startDate: e.target.value }))}
                      style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '10px 12px', color: '#F5F5F5', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>End date</div>
                    <input type="date" value={tripForm.endDate} onChange={e => setTripForm(p => ({ ...p, endDate: e.target.value }))}
                      style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '10px 12px', color: '#F5F5F5', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <input placeholder="Budget ($)" type="number" value={tripForm.budget} onChange={e => setTripForm(p => ({ ...p, budget: e.target.value }))}
                  style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowNewTrip(false)}
                    style={{ flex: 1, background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '12px', color: '#888', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={createTrip}
                    style={{ flex: 1, background: ACCENT, border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create Trip</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewTrip(true)}
                style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <Plus size={18} /> New Trip
              </button>
            )}
          </>
        )}

        {tab === 'plan' && (
          <>
            {!activeTrip ? (
              <div style={{ textAlign: 'center', color: '#444', padding: '50px 20px', fontSize: 14 }}>
                <div style={{ marginBottom: 16 }}>Select or create a trip first</div>
                <button onClick={() => setTab('trips')} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Go to Trips</button>
              </div>
            ) : (
              <>
                {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                  const dayItems = activeTrip.items.filter(i => i.day === day).sort((a, b) => a.time.localeCompare(b.time))
                  const dayDate = activeTrip.startDate ? (() => {
                    const d = new Date(activeTrip.startDate + 'T00:00:00')
                    d.setDate(d.getDate() + day - 1)
                    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                  })() : `Day ${day}`

                  return (
                    <div key={day} style={{ marginBottom: 10 }}>
                      <button onClick={() => setExpandDay(expandDay === day ? null : day)}
                        style={{ width: '100%', background: '#1A1008', border: '1px solid #2A1A0A', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#F5F5F5' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{day}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>Day {day}</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{dayDate} · {dayItems.length} items</div>
                        </div>
                        {expandDay === day ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
                      </button>

                      {expandDay === day && (
                        <div style={{ background: '#0F0A06', border: '1px solid #2A1A0A', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '8px 12px' }}>
                          {dayItems.length === 0 && (
                            <div style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '14px 0' }}>No items for this day</div>
                          )}
                          {dayItems.map(item => {
                            const ti = ITEM_TYPES[item.type]
                            return (
                              <div key={item.id} style={{ background: '#1A1008', borderRadius: 10, padding: '10px 12px', marginBottom: 6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 20 }}>{ti.emoji}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: item.booked ? '#888' : '#F5F5F5', textDecoration: item.booked ? 'line-through' : 'none' }}>{item.title}</div>
                                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                                    {item.time && <span>{item.time} · </span>}
                                    {item.location && <span>{item.location}</span>}
                                    {item.cost > 0 && <span style={{ color: ACCENT }}> · ${item.cost}</span>}
                                  </div>
                                  {item.description && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{item.description}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button onClick={() => toggleBooked(item.id)}
                                    style={{ background: item.booked ? '#22C55E33' : '#2A1A0A', border: 'none', borderRadius: 6, padding: '4px 8px', color: item.booked ? '#22C55E' : '#888', fontSize: 11, cursor: 'pointer' }}>
                                    {item.booked ? '✓' : 'Book'}
                                  </button>
                                  <button onClick={() => deleteItem(item.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444' }}><X size={14} /></button>
                                </div>
                              </div>
                            )
                          })}
                          <button onClick={() => { setItemForm(p => ({ ...p, day })); setShowAddItem(true) }}
                            style={{ width: '100%', background: 'none', border: `1px dashed #2A1A0A`, borderRadius: 8, padding: '8px', color: ACCENT, fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
                            + Add to Day {day}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {tab === 'budget' && (
          <>
            {!activeTrip ? (
              <div style={{ textAlign: 'center', color: '#444', padding: '50px 20px', fontSize: 14 }}>Select a trip to see budget</div>
            ) : (
              <>
                <div style={{ background: '#1A1008', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #2A1A0A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#888' }}>TOTAL BUDGET</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#F5F5F5' }}>${activeTrip.budget.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#888' }}>REMAINING</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: budgetLeft >= 0 ? '#22C55E' : '#EF4444' }}>
                        ${Math.abs(budgetLeft).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {activeTrip.budget > 0 && (
                    <div style={{ height: 8, background: '#2A1A0A', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: Math.min(100, (totalSpent / activeTrip.budget) * 100) + '%', background: budgetLeft < 0 ? '#EF4444' : ACCENT, borderRadius: 4, transition: 'width .3s' }} />
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Spent: <strong style={{ color: ACCENT }}>${totalSpent.toLocaleString()}</strong></div>
                </div>

                {/* Costs by type */}
                <div style={{ background: '#1A1008', borderRadius: 16, padding: 18, border: '1px solid #2A1A0A' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Breakdown by Category</div>
                  {Object.entries(ITEM_TYPES).map(([type, ti]) => {
                    const cost = activeTrip.items.filter(i => i.type === type as ItemType).reduce((s, i) => s + i.cost, 0)
                    if (cost === 0) return null
                    const pct = totalSpent > 0 ? Math.round((cost / totalSpent) * 100) : 0
                    return (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>{ti.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13 }}>{ti.label}</span>
                            <span style={{ fontSize: 13, color: ACCENT }}>${cost}</span>
                          </div>
                          <div style={{ height: 4, background: '#2A1A0A', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: ti.color, borderRadius: 2 }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: '#666', width: 36, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    )
                  })}
                  {totalSpent === 0 && <div style={{ color: '#444', fontSize: 13, textAlign: 'center' }}>No costs tracked yet</div>}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <div style={{ background: '#1A1008', borderRadius: '20px 20px 0 0', padding: 22, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Add Item — Day {itemForm.day}</span>
              <button onClick={() => setShowAddItem(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
            </div>
            {activeTrip && (
              <select value={itemForm.day} onChange={e => setItemForm(p => ({ ...p, day: parseInt(e.target.value) }))}
                style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}>
                {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => <option key={d} value={d}>Day {d}</option>)}
              </select>
            )}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {Object.entries(ITEM_TYPES).map(([type, ti]) => (
                <button key={type} onClick={() => setItemForm(p => ({ ...p, type: type as ItemType }))}
                  style={{ background: itemForm.type === type ? ti.color + '33' : '#2A1A0A', border: itemForm.type === type ? `1px solid ${ti.color}` : '1px solid transparent', borderRadius: 8, padding: '5px 12px', color: itemForm.type === type ? ti.color : '#888', fontSize: 12, cursor: 'pointer' }}>
                  {ti.emoji} {ti.label}
                </button>
              ))}
            </div>
            <input placeholder="Title *" value={itemForm.title} onChange={e => setItemForm(p => ({ ...p, title: e.target.value }))}
              style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input type="time" value={itemForm.time} onChange={e => setItemForm(p => ({ ...p, time: e.target.value }))}
                style={{ background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14 }} />
              <input placeholder="Cost ($)" type="number" value={itemForm.cost} onChange={e => setItemForm(p => ({ ...p, cost: e.target.value }))}
                style={{ background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14 }} />
            </div>
            <input placeholder="Location" value={itemForm.location} onChange={e => setItemForm(p => ({ ...p, location: e.target.value }))}
              style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
            <textarea placeholder="Description (optional)" value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))}
              rows={2} style={{ width: '100%', background: '#2A1A0A', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, resize: 'none', marginBottom: 14, boxSizing: 'border-box', lineHeight: 1.5 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAddItem(false)}
                style={{ flex: 1, background: '#2A1A0A', border: 'none', borderRadius: 12, padding: '13px', color: '#888', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addItem}
                style={{ flex: 2, background: ACCENT, border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
