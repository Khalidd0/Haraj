import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { CategoryContext } from '../context/CategoryContext'
import { actOnReport, deleteReport, listReports } from '../api/reports'
import { createCategory, deleteCategory, updateCategory } from '../api/categories'
import { listUsers, reactivateUser, suspendUser } from '../api/users'
import { createRule, deleteRule, listPublicRules, listRules, updateRule } from '../api/rules'

export default function AdminDashboard() {
  const { user } = useContext(AuthContext)
  const { categories, setCategories } = useContext(CategoryContext)

  const [reports, setReports] = useState([])
  const [reportsError, setReportsError] = useState('')

  const [newCat, setNewCat] = useState('')
  const [categoriesError, setCategoriesError] = useState('')

  const [users, setUsers] = useState([])
  const [userQuery, setUserQuery] = useState('')
  const [usersError, setUsersError] = useState('')

  const [rules, setRules] = useState([])
  const [rulesError, setRulesError] = useState('')
  const [newRuleTitle, setNewRuleTitle] = useState('')
  const [newRuleBody, setNewRuleBody] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      listReports()
        .then(res => setReports(res.reports || []))
        .catch(err => setReportsError(err.message || 'Failed to load reports'))

      listRules()
        .then(res => setRules(res.rules || []))
        .catch(err => setRulesError(err.message || 'Failed to load rules'))

      listUsers()
        .then(res => setUsers(res.users || []))
        .catch(err => setUsersError(err.message || 'Failed to load users'))
    }
  }, [user])

  async function refreshReports() {
    try {
      const res = await listReports()
      setReports(res.reports || [])
    } catch (err) {
      setReportsError(err.message || 'Failed to load reports')
    }
  }

  async function onDismissReport(id) {
    try {
      await deleteReport(id)
      setReports(arr => arr.filter(r => r._id !== id && r.id !== id))
    } catch (err) {
      setReportsError(err.message || 'Failed to dismiss report')
    }
  }

  async function handleReportAction(report, action) {
    try {
      await actOnReport(report.id || report._id, action)
      await refreshReports()
    } catch (err) {
      setReportsError(err.message || 'Failed to apply action')
    }
  }

  async function addCategory() {
    if (!newCat.trim()) return
    try {
      const res = await createCategory(newCat.trim())
      setNewCat('')
      setCategories(arr => [...arr, res.category])
    } catch (err) {
      setCategoriesError(err.message || 'Failed to add category')
    }
  }

  async function renameCategory(cat) {
    const name = window.prompt('Rename category', cat.name)
    if (!name || !name.trim()) return
    try {
      const res = await updateCategory(cat.id, name.trim())
      setCategories(arr => arr.map(c => (c.id === res.category.id ? res.category : c)))
    } catch (err) {
      setCategoriesError(err.message || 'Failed to rename category')
    }
  }

  async function removeCategory(id) {
    try {
      await deleteCategory(id)
      setCategories(arr => arr.filter(c => c.id !== id))
    } catch (err) {
      setCategoriesError(err.message || 'Failed to delete category')
    }
  }

  async function handleSearchUsers(e) {
    e?.preventDefault?.()
    try {
      const res = await listUsers(userQuery.trim() || undefined)
      setUsers(res.users || [])
    } catch (err) {
      setUsersError(err.message || 'Failed to search users')
    }
  }

  async function handleSuspendUser(id) {
    try {
      const res = await suspendUser(id)
      setUsers(arr => arr.map(u => ((u.id || u._id) === (res.user.id || res.user._id) ? res.user : u)))
    } catch (err) {
      setUsersError(err.message || 'Failed to suspend user')
    }
  }

  async function handleReactivateUser(id) {
    try {
      const res = await reactivateUser(id)
      setUsers(arr => arr.map(u => ((u.id || u._id) === (res.user.id || res.user._id) ? res.user : u)))
    } catch (err) {
      setUsersError(err.message || 'Failed to reactivate user')
    }
  }

  async function handleCreateRule(e) {
    e.preventDefault()
    if (!newRuleTitle.trim() || !newRuleBody.trim()) return
    try {
      const res = await createRule({
        title: newRuleTitle.trim(),
        body: newRuleBody.trim(),
        published: true
      })
      setRules(arr => [res.rule, ...arr])
      setNewRuleTitle('')
      setNewRuleBody('')
    } catch (err) {
      setRulesError(err.message || 'Failed to create rule')
    }
  }

  async function handleTogglePublishRule(rule) {
    try {
      const res = await updateRule(rule.id || rule._id, { published: !rule.published })
      setRules(arr => arr.map(r => ((r.id || r._id) === (res.rule.id || res.rule._id) ? res.rule : r)))
    } catch (err) {
      setRulesError(err.message || 'Failed to update rule')
    }
  }

  async function handleDeleteRule(rule) {
    try {
      await deleteRule(rule.id || rule._id)
      setRules(arr => arr.filter(r => (r.id || r._id) !== (rule.id || rule._id)))
    } catch (err) {
      setRulesError(err.message || 'Failed to delete rule')
    }
  }

  async function handleEditRule(rule) {
    const title = window.prompt('Edit title', rule.title)
    if (!title || !title.trim()) return
    const body = window.prompt('Edit body', rule.body)
    if (!body || !body.trim()) return
    try {
      const res = await updateRule(rule.id || rule._id, {
        title: title.trim(),
        body: body.trim()
      })
      setRules(arr => arr.map(r => ((r.id || r._id) === (res.rule.id || res.rule._id) ? res.rule : r)))
    } catch (err) {
      setRulesError(err.message || 'Failed to edit rule')
    }
  }

  if (user?.role !== 'admin') {
    return <div className='text-red-600'>Admin access required.</div>
  }

  return (
    <div className='space-y-6'>
      {/* Reports / flagged content */}
      <section className='card p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Reports</h2>
          <button className='btn btn-outline text-sm' onClick={refreshReports}>Refresh</button>
        </div>
        {reportsError && <div className='text-sm text-red-600'>{reportsError}</div>}
        <div className='space-y-2'>
          {reports.length ? reports.map(r => (
            <div key={r.id || r._id} className='border rounded px-3 py-2 flex items-center justify-between gap-4'>
              <div>
                <div className='font-medium'>{r.reason}</div>
                <div className='text-xs text-gray-500'>
                  Type: {r.type} · Target #{r.targetId} · by {r.byEmail}
                </div>
              </div>
              <div className='flex flex-wrap gap-2 text-xs'>
                {r.type === 'listing' && (
                  <>
                    <button
                      className='btn btn-outline'
                      onClick={() => handleReportAction(r, 'hide_listing')}
                    >
                      Hide listing
                    </button>
                    <button
                      className='btn btn-outline'
                      onClick={() => handleReportAction(r, 'delete_listing')}
                    >
                      Delete listing
                    </button>
                  </>
                )}
                {r.type === 'user' && (
                  <button
                    className='btn btn-outline'
                    onClick={() => handleReportAction(r, 'suspend_user')}
                  >
                    Suspend user
                  </button>
                )}
                <button
                  className='btn btn-outline'
                  onClick={() => onDismissReport(r.id || r._id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )) : <div className='text-gray-500 text-sm'>No reports</div>}
        </div>
      </section>

      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Categories */}
        <section className='card p-4 space-y-3'>
          <h2 className='text-xl font-semibold mb-1'>Categories</h2>
          {categoriesError && <div className='text-sm text-red-600'>{categoriesError}</div>}
          <div className='flex gap-2'>
            <input
              className='input flex-1'
              placeholder='Add category'
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
            />
            <button className='btn btn-primary' onClick={addCategory}>Add</button>
          </div>
          <div className='space-y-1 max-h-60 overflow-y-auto'>
            {categories.map(c => (
              <div key={c.id} className='flex items-center justify-between border rounded px-2 py-1 text-sm'>
                <div>{c.name}</div>
                <div className='flex gap-2'>
                  <button
                    className='underline'
                    onClick={() => renameCategory(c)}
                  >
                    Edit
                  </button>
                  <button className='underline text-red-600' onClick={() => removeCategory(c.id)}>Delete</button>
                </div>
              </div>
            ))}
            {!categories.length && <div className='text-xs text-gray-500'>No categories yet.</div>}
          </div>
        </section>

        {/* Users management */}
        <section className='card p-4 space-y-3'>
          <h2 className='text-xl font-semibold mb-1'>Users</h2>
          {usersError && <div className='text-sm text-red-600'>{usersError}</div>}
          <form className='flex gap-2' onSubmit={handleSearchUsers}>
            <input
              className='input flex-1'
              placeholder='Search by email or name'
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
            />
            <button className='btn btn-primary text-sm' type='submit'>Search</button>
          </form>
          <div className='space-y-1 max-h-60 overflow-y-auto text-sm'>
            {users.map(u => (
              <div key={u.id || u._id} className='flex items-center justify-between border rounded px-2 py-1'>
                <div>
                  <div className='font-medium'>{u.name}</div>
                  <div className='text-xs text-gray-500'>
                    {u.email} · {u.role} · {u.status || 'active'}
                  </div>
                </div>
                <div className='flex gap-2 text-xs'>
                  {u.status === 'suspended' ? (
                    <button className='underline text-green-700' onClick={() => handleReactivateUser(u.id || u._id)}>
                      Reactivate
                    </button>
                  ) : (
                    <button className='underline text-red-600' onClick={() => handleSuspendUser(u.id || u._id)}>
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!users.length && <div className='text-xs text-gray-500'>No users found.</div>}
          </div>
        </section>
      </div>

      {/* Rules / announcements */}
      <section className='card p-4 space-y-3'>
        <h2 className='text-xl font-semibold'>Marketplace Rules & Announcements</h2>
        {rulesError && <div className='text-sm text-red-600'>{rulesError}</div>}
        <form className='grid md:grid-cols-2 gap-3' onSubmit={handleCreateRule}>
          <div>
            <label className='text-sm'>Title</label>
            <input
              className='input mt-1'
              value={newRuleTitle}
              onChange={e => setNewRuleTitle(e.target.value)}
              placeholder='e.g. Prohibited items policy'
            />
          </div>
          <div>
            <label className='text-sm'>Body</label>
            <textarea
              className='input mt-1'
              rows={2}
              value={newRuleBody}
              onChange={e => setNewRuleBody(e.target.value)}
              placeholder='Short description of the rule'
            />
          </div>
          <div className='md:col-span-2'>
            <button className='btn btn-primary text-sm'>Post rule</button>
          </div>
        </form>
        <div className='space-y-2'>
          {rules.map(rule => (
            <div key={rule.id || rule._id} className='border rounded px-3 py-2'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <div className='font-semibold'>
                    {rule.title}{' '}
                    {!rule.published && <span className='text-xs text-gray-500'>(Unpublished)</span>}
                  </div>
                  <div className='text-xs text-gray-600 whitespace-pre-line'>
                    {rule.body}
                  </div>
                </div>
                <div className='flex flex-col gap-1 text-xs'>
                  <button
                    className='underline'
                    onClick={() => handleTogglePublishRule(rule)}
                  >
                    {rule.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    className='underline'
                    onClick={() => handleEditRule(rule)}
                  >
                    Edit
                  </button>
                  <button
                    className='underline text-red-600'
                    onClick={() => handleDeleteRule(rule)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!rules.length && <div className='text-xs text-gray-500'>No rules yet.</div>}
        </div>
      </section>
    </div>
  )
}
