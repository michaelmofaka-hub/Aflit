
import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiRequest } from './api'

function useAnalyticsData(enabled = true) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in first.')
      }

      const records = await apiRequest('/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setHistory(
        records.filter(
          record => record.platform === 'youtube'
        )
      )
    } catch (err) {
      setError(err.message || 'Could not load analytics history.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
  setHistory([])
  setError('')
  setLoading(false)
  return
}

    refreshHistory().catch(() => {})
  }, [enabled, refreshHistory])

  const dailyHistory = useMemo(() => {
    const snapshotsByContent = history.reduce((groups, record) => {
      if (!record.content_id || !record.recorded_at) {
        return groups
      }

      if (!groups[record.content_id]) {
        groups[record.content_id] = []
      }

      groups[record.content_id].push(record)
      return groups
    }, {})

    const growthByDate = {}

    Object.values(snapshotsByContent).forEach(snapshots => {
      snapshots.sort(
        (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
      )

      for (let i = 1; i < snapshots.length; i++) {
        const previousViews = Number(
          snapshots[i - 1].metrics?.views || 0
        )

        const currentViews = Number(
          snapshots[i].metrics?.views || 0
        )

        const viewsGained = Math.max(
          currentViews - previousViews,
          0
        )

        const date = new Date(
          snapshots[i].recorded_at
        ).toISOString().slice(0, 10)

        if (!growthByDate[date]) {
          growthByDate[date] = { date, views: 0 }
        }

        growthByDate[date].views += viewsGained
      }
    })

    return Object.values(growthByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        day: new Date(
          `${item.date}T00:00:00`
        ).toLocaleDateString(),
        views: item.views
      }))
  }, [history])

  return {
    history,
    dailyHistory,
    loading,
    error,
    refreshHistory
  }
}

export default useAnalyticsData
