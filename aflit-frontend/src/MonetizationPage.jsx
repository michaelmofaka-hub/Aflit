
import { useMemo, useState } from 'react'
import './App.css'

function MonetizationPage() {
  const [period, setPeriod] = useState('30 days')
  const [activeTab, setActiveTab] = useState('Overview')
  const [transactionFilter, setTransactionFilter] = useState('All')
  const [notice, setNotice] = useState('')

  // --------------------------------------------------
  // 1. DEMO REVENUE DATA
  // This will later come from the backend.
  // --------------------------------------------------

  const revenueData = {
    '7 days': {
      total: 2100,
      previous: 1800,
      confirmed: 1500,
      pending: 400,
      estimated: 200,
      sources: [
        { name: 'Advertising', amount: 1400 },
        { name: 'Subscriptions', amount: 450 },
        { name: 'Other', amount: 250 }
      ],
      chart: [
        { label: 'Mon', amount: 200 },
        { label: 'Tue', amount: 350 },
        { label: 'Wed', amount: 250 },
        { label: 'Thu', amount: 400 },
        { label: 'Fri', amount: 300 },
        { label: 'Sat', amount: 350 },
        { label: 'Sun', amount: 250 }
      ]
    },

    '30 days': {
      total: 8500,
      previous: 7200,
      confirmed: 6200,
      pending: 1500,
      estimated: 800,
      sources: [
        { name: 'Advertising', amount: 5200 },
        { name: 'Subscriptions', amount: 2100 },
        { name: 'Other', amount: 1200 }
      ],
      chart: [
        { label: 'Week 1', amount: 1500 },
        { label: 'Week 2', amount: 2200 },
        { label: 'Week 3', amount: 1900 },
        { label: 'Week 4', amount: 2900 }
      ]
    },

    '90 days': {
      total: 24500,
      previous: 21000,
      confirmed: 18000,
      pending: 4200,
      estimated: 2300,
      sources: [
        { name: 'Advertising', amount: 15000 },
        { name: 'Subscriptions', amount: 6200 },
        { name: 'Other', amount: 3300 }
      ],
      chart: [
        { label: 'Month 1', amount: 6500 },
        { label: 'Month 2', amount: 7800 },
        { label: 'Month 3', amount: 10200 }
      ]
    }
  }

  const revenue = revenueData[period]

  // --------------------------------------------------
  // 2. REVENUE CALCULATIONS
  // --------------------------------------------------

  const change = revenue.previous
    ? ((revenue.total - revenue.previous) / revenue.previous) * 100
    : 0

  const maxRevenue = Math.max(
    ...revenue.sources.map((source) => source.amount),
    1
  )

  const maxChartValue = Math.max(
    ...revenue.chart.map((item) => item.amount),
    1
  )

  const formatMoney = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString('en-KE')}`

  // --------------------------------------------------
  // 3. DEMO TRANSACTIONS
  // --------------------------------------------------

  const transactions = [
    {
      id: 'TXN-1001',
      description: 'YouTube advertising revenue',
      source: 'Advertising',
      type: 'Earning',
      amount: 2400,
      status: 'Confirmed',
      date: '2026-11-12'
    },
    {
      id: 'TXN-1002',
      description: 'Channel membership',
      source: 'Subscriptions',
      type: 'Earning',
      amount: 1200,
      status: 'Confirmed',
      date: '2026-11-10'
    },
    {
      id: 'TXN-1003',
      description: 'Creator support',
      source: 'Tips',
      type: 'Earning',
      amount: 500,
      status: 'Pending',
      date: '2026-11-09'
    },
    {
      id: 'TXN-1004',
      description: 'Digital product sale',
      source: 'Products',
      type: 'Earning',
      amount: 1500,
      status: 'Confirmed',
      date: '2026-11-08'
    },
    {
      id: 'TXN-1005',
      description: 'Advertising adjustment',
      source: 'Advertising',
      type: 'Refund',
      amount: -300,
      status: 'Reversed',
      date: '2026-11-06'
    },
    {
      id: 'TXN-1006',
      description: 'Sponsorship payment',
      source: 'Sponsorships',
      type: 'Earning',
      amount: 3500,
      status: 'Estimated',
      date: '2026-11-04'
    }
  ]

  const filteredTransactions = useMemo(() => {
    if (transactionFilter === 'All') {
      return transactions
    }

    return transactions.filter(
      (transaction) => transaction.status === transactionFilter
    )
  }, [transactionFilter])

  // --------------------------------------------------
  // 4. DEMO MONETIZATION METHODS
  // --------------------------------------------------

  const monetizationMethods = [
    {
      name: 'Advertising',
      description: 'Earn revenue from ads displayed on your content.',
      status: 'Available',
      category: 'Platform monetization'
    },
    {
      name: 'Subscriptions',
      description: 'Generate recurring income from paying supporters.',
      status: 'Coming soon',
      category: 'Recurring income'
    },
    {
      name: 'Tips & Support',
      description: 'Allow your audience to support your work directly.',
      status: 'Coming soon',
      category: 'Direct support'
    },
    {
      name: 'Digital Products',
      description: 'Sell guides, courses, downloads and other digital products.',
      status: 'Coming soon',
      category: 'Product sales'
    },
    {
      name: 'Sponsorships',
      description: 'Track income from brand deals and sponsored content.',
      status: 'Coming soon',
      category: 'Brand partnerships'
    }
  ]

  // --------------------------------------------------
  // 5. DEMO PAYOUT INFORMATION
  // --------------------------------------------------

  const payoutData = {
    availableBalance: 6200,
    pendingBalance: 1500,
    minimumPayout: 500,
    paymentMethod: 'Not configured',
    history: [
      {
        id: 'PAY-001',
        date: '2026-10-28',
        amount: 4500,
        method: 'M-Pesa',
        status: 'Paid'
      },
      {
        id: 'PAY-002',
        date: '2026-10-15',
        amount: 2500,
        method: 'M-Pesa',
        status: 'Paid'
      },
      {
        id: 'PAY-003',
        date: '2026-10-05',
        amount: 1800,
        method: 'Bank transfer',
        status: 'Processing'
      }
    ]
  }

  // --------------------------------------------------
  // 6. NAVIGATION
  // --------------------------------------------------

  const tabs = [
    'Overview',
    'Revenue Sources',
    'Transactions',
    'Monetization Methods',
    'Payouts'
  ]

  function handleAction(message) {
    setNotice(message)
  }

  // --------------------------------------------------
  // 7. PAGE
  // --------------------------------------------------

  return (
    <section className="monetization-page">

      {/* PAGE HEADER */}

      <div className="monetization-heading">
        <div>
          <h1>Monetization</h1>
          <p>
            Manage your creator earnings, revenue streams and payouts.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Revenue reporting period"
        >
          <option value="7 days">Last 7 days</option>
          <option value="30 days">Last 30 days</option>
          <option value="90 days">Last 90 days</option>
        </select>
      </div>

      <p className="sample-notice">
        Demo data — figures are illustrative and are not connected to real earnings.
      </p>

      {/* FRONTEND NOTICE */}

      {notice && (
        <div className="monetization-notice">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* SECTION NAVIGATION */}

      <nav className="monetization-tabs" aria-label="Monetization sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'active' : ''}
            onClick={() => {
              setActiveTab(tab)
              setNotice('')
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* ==========================================
          OVERVIEW
      ========================================== */}

      {activeTab === 'Overview' && (
        <div className="monetization-section">

          <div className="monetization-section-heading">
            <div>
              <h2>Revenue Overview</h2>
              <p>Your earnings performance for the selected period.</p>
            </div>
          </div>

          {/* REVENUE METRICS */}

          <div className="monetization-metrics">

            <div className="monetization-card">
              <p>Total Revenue</p>
              <h2>{formatMoney(revenue.total)}</h2>
              <span className={change >= 0 ? 'positive-change' : 'negative-change'}>
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}% vs previous period
              </span>
            </div>

            <div className="monetization-card">
              <p>Confirmed Revenue</p>
              <h2>{formatMoney(revenue.confirmed)}</h2>
              <span>Verified earnings</span>
            </div>

            <div className="monetization-card">
              <p>Pending Revenue</p>
              <h2>{formatMoney(revenue.pending)}</h2>
              <span>Awaiting confirmation</span>
            </div>

            <div className="monetization-card">
              <p>Estimated Revenue</p>
              <h2>{formatMoney(revenue.estimated)}</h2>
              <span>Not yet finalized</span>
            </div>

          </div>

          {/* REVENUE PERFORMANCE */}

          <div className="revenue-breakdown">
            <h2>Revenue Performance</h2>
            <p>Track how your revenue changes over time.</p>

            <div className="revenue-chart">
              {revenue.chart.map((item) => (
                <div className="revenue-chart-column" key={item.label}>
                  <div className="revenue-chart-value">
                    {formatMoney(item.amount)}
                  </div>

                  <div className="revenue-chart-track">
                    <div
                      className="revenue-chart-bar"
                      style={{
                        height: `${(item.amount / maxChartValue) * 100}%`
                      }}
                    />
                  </div>

                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* REVENUE BREAKDOWN */}

          <div className="revenue-breakdown">
            <h2>Revenue Breakdown</h2>
            <p>Understand where your earnings come from.</p>

            {revenue.sources.map((source) => (
              <div className="revenue-row" key={source.name}>
                <div className="revenue-label">
                  <span>{source.name}</span>
                  <strong>{formatMoney(source.amount)}</strong>
                </div>

                <div className="revenue-track">
                  <div
                    className="revenue-bar"
                    style={{
                      width: `${(source.amount / maxRevenue) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* RECENT TRANSACTIONS */}

          <div className="revenue-breakdown">
            <div className="monetization-section-heading">
              <div>
                <h2>Recent Transactions</h2>
                <p>Your latest recorded revenue activity.</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('Transactions')}
              >
                View all
              </button>
            </div>

            <div className="monetization-table-wrapper">
              <table className="monetization-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.slice(0, 4).map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.description}</td>
                      <td>{transaction.source}</td>
                      <td>{transaction.date}</td>
                      <td>
                        <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>{formatMoney(transaction.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          REVENUE SOURCES
      ========================================== */}

      {activeTab === 'Revenue Sources' && (
        <div className="monetization-section">

          <div className="monetization-section-heading">
            <div>
              <h2>Revenue Sources</h2>
              <p>See which monetization channels generate income.</p>
            </div>
          </div>

          <div className="monetization-metrics">
            <div className="monetization-card">
              <p>Total Revenue Sources</p>
              <h2>{revenue.sources.length}</h2>
              <span>Recorded categories</span>
            </div>

            <div className="monetization-card">
              <p>Largest Revenue Source</p>
              <h2>
                {revenue.sources.reduce((largest, source) =>
                  source.amount > largest.amount ? source : largest
                ).name}
              </h2>
              <span>Highest earning category</span>
            </div>
          </div>

          <div className="revenue-breakdown">
            <h2>Source Performance</h2>
            <p>Revenue generated by each source.</p>

            {revenue.sources.map((source) => (
              <div className="revenue-row" key={source.name}>
                <div className="revenue-label">
                  <span>{source.name}</span>
                  <strong>{formatMoney(source.amount)}</strong>
                </div>

                <div className="revenue-track">
                  <div
                    className="revenue-bar"
                    style={{
                      width: `${(source.amount / maxRevenue) * 100}%`
                    }}
                  />
                </div>

                <span className="source-percentage">
                  {((source.amount / revenue.total) * 100).toFixed(1)}% of revenue
                </span>
              </div>
            ))}
          </div>

          <div className="revenue-breakdown">
            <h2>Available Revenue Categories</h2>
            <p>These are the income types Aflit is designed to track.</p>

            <div className="monetization-method-list">
              {[
                'Advertising',
                'Memberships',
                'Tips and Support',
                'Digital Product Sales',
                'Sponsorships',
                'Other Income'
              ].map((source) => (
                <div className="monetization-method-row" key={source}>
                  <div>
                    <h3>{source}</h3>
                    <p>Revenue category available for tracking.</p>
                  </div>
                  <span>Trackable</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TRANSACTIONS
      ========================================== */}

      {activeTab === 'Transactions' && (
        <div className="monetization-section">

          <div className="monetization-section-heading">
            <div>
              <h2>Transactions</h2>
              <p>Review your earnings, adjustments and refunds.</p>
            </div>

            <select
              value={transactionFilter}
              onChange={(event) => setTransactionFilter(event.target.value)}
              aria-label="Filter transactions by status"
            >
              <option value="All">All transactions</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Estimated">Estimated</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          <div className="monetization-table-wrapper">
            <table className="monetization-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.source}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{formatMoney(transaction.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="monetization-empty">
                <h3>No transactions found</h3>
                <p>There are no transactions matching this filter.</p>
              </div>
            )}
          </div>

          <div className="monetization-info">
            <h3>Transaction statuses</h3>
            <p><strong>Confirmed:</strong> Earnings verified by the revenue provider.</p>
            <p><strong>Pending:</strong> Earnings awaiting confirmation or settlement.</p>
            <p><strong>Estimated:</strong> Preliminary earnings that may change.</p>
            <p><strong>Reversed:</strong> A transaction that has been refunded or reversed.</p>
          </div>

        </div>
      )}

      {/* ==========================================
          MONETIZATION METHODS
      ========================================== */}

      {activeTab === 'Monetization Methods' && (
        <div className="monetization-section">

          <div className="monetization-section-heading">
            <div>
              <h2>Monetization Methods</h2>
              <p>Manage the different ways you can earn as a creator.</p>
            </div>
          </div>

          <div className="monetization-method-list">
            {monetizationMethods.map((method) => (
              <div className="monetization-method-row" key={method.name}>
                <div>
                  <span className="method-category">{method.category}</span>
                  <h3>{method.name}</h3>
                  <p>{method.description}</p>
                </div>

                <div className="method-actions">
                  <span className={`method-status ${method.status.toLowerCase().replaceAll(' ', '-')}`}>
                    {method.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAction(
                      `${method.name} setup will be available after backend integration.`
                    )}
                  >
                    {method.status === 'Available' ? 'Manage' : 'Learn more'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="monetization-info">
            <h3>About monetization</h3>
            <p>
              Aflit is designed to bring multiple creator income streams
              into one workspace. Each method will have its own setup,
              eligibility requirements, transactions and performance data.
            </p>
          </div>

        </div>
      )}

      {/* ==========================================
          PAYOUTS
      ========================================== */}

      {activeTab === 'Payouts' && (
        <div className="monetization-section">

          <div className="monetization-section-heading">
            <div>
              <h2>Payouts</h2>
              <p>Review your available earnings and payment history.</p>
            </div>
          </div>

          <div className="monetization-metrics">

            <div className="monetization-card">
              <p>Available Balance</p>
              <h2>{formatMoney(payoutData.availableBalance)}</h2>
              <span>Illustrative withdrawable balance</span>
            </div>

            <div className="monetization-card">
              <p>Pending Balance</p>
              <h2>{formatMoney(payoutData.pendingBalance)}</h2>
              <span>Awaiting settlement</span>
            </div>

            <div className="monetization-card">
              <p>Minimum Payout</p>
              <h2>{formatMoney(payoutData.minimumPayout)}</h2>
              <span>Illustrative minimum threshold</span>
            </div>

          </div>

          <div className="revenue-breakdown">
            <h2>Payment Details</h2>

            <div className="monetization-method-row">
              <div>
                <h3>Default Payment Method</h3>
                <p>{payoutData.paymentMethod}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAction(
                  'Payment method configuration will be connected to the backend.'
                )}
              >
                Configure payment method
              </button>
            </div>
          </div>

          <div className="revenue-breakdown">
            <div className="monetization-section-heading">
              <div>
                <h2>Payout History</h2>
                <p>Previously processed payout requests.</p>
              </div>

              <button
                type="button"
                onClick={() => handleAction(
                  'Payout requests will be enabled after payment integration.'
                )}
              >
                Request payout
              </button>
            </div>

            <div className="monetization-table-wrapper">
              <table className="monetization-table">
                <thead>
                  <tr>
                    <th>Payout ID</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {payoutData.history.map((payout) => (
                    <tr key={payout.id}>
                      <td>{payout.id}</td>
                      <td>{payout.date}</td>
                      <td>{payout.method}</td>
                      <td>
                        <span className={`transaction-status ${payout.status.toLowerCase()}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td>{formatMoney(payout.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="monetization-info">
            <h3>Important</h3>
            <p>
              Payout balances, payment methods and payout history are
              demonstration data. Actual payout processing requires
              verified revenue records and payment-provider integration.
            </p>
          </div>

        </div>
      )}

    </section>
  )
}

export default MonetizationPage
