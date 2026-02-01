import { createPortal } from 'react-dom';

function AccountSummary({ isOpen, onClose, currentUser }) {
  const [orders, setOrders] = React.useState([]);
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    totalSpent: 0,
    savedItems: 0,
    recentActivity: []
  });

  React.useEffect(() => {
    if (isOpen) {
      loadAccountData();
    }
  }, [isOpen]);

  const loadAccountData = () => {
    try {
      // Load mock order data
      const mockOrders = [
        {
          id: 'LM123456',
          date: '2024-01-15',
          total: 299.99,
          status: 'Delivered',
          items: 3
        },
        {
          id: 'LM123457',
          date: '2024-01-10',
          total: 149.50,
          status: 'Shipped',
          items: 2
        },
        {
          id: 'LM123458',
          date: '2024-01-05',
          total: 89.99,
          status: 'Processing',
          items: 1
        }
      ];

      setOrders(mockOrders);

      // Calculate stats
      const totalSpent = mockOrders.reduce((sum, order) => sum + order.total, 0);
      const watchlist = JSON.parse(localStorage.getItem('luxemarket_watchlist') || '[]');

      setStats({
        totalOrders: mockOrders.length,
        totalSpent: totalSpent,
        savedItems: watchlist.length,
        recentActivity: [
          'Added Premium Headphones to cart',
          'Saved Luxury Watch to watchlist',
          'Completed order LM123456',
          'Updated shipping address'
        ]
      });
    } catch (error) {
      console.error('Error loading account data:', error);
      showToast('Error loading account data', 'error');
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4 modal-overlay modal-backdrop" style={{ isolation: 'isolate' }}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Account Summary</h2>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {currentUser?.name || 'User'}!
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Cards */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="icon-shopping-bag text-2xl text-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="icon-dollar-sign text-2xl text-green-600 mr-3"></div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-green-900">${stats.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="icon-heart text-2xl text-purple-600 mr-3"></div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Saved Items</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.savedItems}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">{order.items} items</p>
                        <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-center">
          <button
            onClick={onClose}
            className="btn btn-primary px-8 py-3"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AccountSummary;
