'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Crown,
  ChevronLeft,
  Search,
  Trash2,
  Star,
  TrendingUp,
  Gamepad2,
  Trophy,
  Ban,
  Plus,
  Minus,
  RotateCcw,
  X,
  Check,
  Save,
  Eye,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameStore } from '@/store/game-store';
import { toast } from '@/hooks/use-toast';

interface GameRecord {
  id: string;
  gameType: string;
  tableNumber: number;
  score: number;
  correct: number;
  wrong: number;
  total: number;
  createdAt: string;
}

interface Player {
  id: string;
  name: string;
  email: string;
  image: string | null;
  avatarId: number;
  points: number;
  isAdmin: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  createdAt: string;
  gameRecords: GameRecord[];
}

type AdminTab = 'overview' | 'players' | 'settings';

export function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalGames: 0,
    totalPoints: 0,
    avgScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // إعدادات النظام
  const [avatarPrice, setAvatarPrice] = useState(100);
  const [pointsPerAnswer, setPointsPerAnswer] = useState(1);
  const [isSavingAvatarPrice, setIsSavingAvatarPrice] = useState(false);
  const [isSavingPointsPerAnswer, setIsSavingPointsPerAnswer] = useState(false);
  const [savedAvatarPrice, setSavedAvatarPrice] = useState(false);
  const [savedPointsPerAnswer, setSavedPointsPerAnswer] = useState(false);
  
  // اللاعب المحدد
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(10);
  const [blockReason, setBlockReason] = useState('');
  
  const dispatch = useGameStore((state) => state.dispatch);

  useEffect(() => {
    fetchAdminData();
    fetchSettings();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.avatarPrice) setAvatarPrice(data.avatarPrice);
        if (data.pointsPerAnswer) setPointsPerAnswer(data.pointsPerAnswer);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveAvatarPrice = async () => {
    if (avatarPrice < 1) {
      toast({ title: 'خطأ', description: 'السعر يجب أن يكون على الأقل 1', variant: 'destructive' });
      return;
    }
    
    setIsSavingAvatarPrice(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarPrice })
      });
      
      if (response.ok) {
        setSavedAvatarPrice(true);
        setTimeout(() => setSavedAvatarPrice(false), 2000);
        toast({ title: 'تم الحفظ', description: `تم تحديث سعر الصورة إلى ${avatarPrice} نقطة` });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ الإعداد', variant: 'destructive' });
    }
    setIsSavingAvatarPrice(false);
  };

  const handleSavePointsPerAnswer = async () => {
    if (pointsPerAnswer < 1) {
      toast({ title: 'خطأ', description: 'النقاط يجب أن تكون على الأقل 1', variant: 'destructive' });
      return;
    }
    
    setIsSavingPointsPerAnswer(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsPerAnswer })
      });
      
      if (response.ok) {
        setSavedPointsPerAnswer(true);
        setTimeout(() => setSavedPointsPerAnswer(false), 2000);
        toast({ title: 'تم الحفظ', description: `تم تحديث نقاط الإجابة إلى ${pointsPerAnswer} نقطة` });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ الإعداد', variant: 'destructive' });
    }
    setIsSavingPointsPerAnswer(false);
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا اللاعب؟')) return;
    
    try {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPlayers(players.filter(p => p.id !== playerId));
        toast({ title: 'تم الحذف', description: 'تم حذف اللاعب بنجاح' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حذف اللاعب', variant: 'destructive' });
    }
  };

  const handleToggleAdmin = async (playerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(players.map(p => 
          p.id === playerId ? { ...p, isAdmin: data.isAdmin } : p
        ));
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer({ ...selectedPlayer, isAdmin: data.isAdmin });
        }
        toast({ title: 'تم التحديث', description: !currentStatus ? 'تم منح صلاحيات الأدمن' : 'تم إزالة صلاحيات الأدمن' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في تحديث الصلاحيات', variant: 'destructive' });
    }
  };

  const handleToggleBlock = async (playerId: string, currentStatus: boolean, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isBlocked: !currentStatus,
          blockedReason: !currentStatus ? reason : null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(players.map(p => 
          p.id === playerId ? { ...p, isBlocked: data.isBlocked, blockedReason: data.blockedReason } : p
        ));
        
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer({ ...selectedPlayer, isBlocked: data.isBlocked, blockedReason: data.blockedReason });
        }
        
        if (!currentStatus) {
          toast({ 
            title: 'تم الحظر', 
            description: 'تم حظر اللاعب بنجاح. سيتم تسجيل خروجه تلقائياً عند محاولته الدخول.' 
          });
        } else {
          toast({ title: 'تم فك الحظر', description: 'يمكن للاعب تسجيل الدخول الآن' });
        }
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في تحديث الحظر', variant: 'destructive' });
    }
  };

  const handleAddPoints = async (playerId: string, amount: number) => {
    try {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addPoints: amount })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(players.map(p => 
          p.id === playerId ? { ...p, points: data.points } : p
        ));
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer({ ...selectedPlayer, points: data.points });
        }
        toast({ title: 'تم الإضافة', description: `تمت إضافة ${amount} نقطة` });
      } else {
        const errorData = await response.json();
        toast({ title: 'خطأ', description: errorData.error || 'فشل في إضافة النقاط', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في إضافة النقاط', variant: 'destructive' });
    }
  };

  const handleRemovePoints = async (playerId: string, amount: number) => {
    try {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removePoints: amount })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(players.map(p => 
          p.id === playerId ? { ...p, points: data.points } : p
        ));
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer({ ...selectedPlayer, points: data.points });
        }
        toast({ title: 'تم الخصم', description: `تم خصم ${amount} نقطة` });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في خصم النقاط', variant: 'destructive' });
    }
  };

  const handleResetPoints = async (playerId: string) => {
    if (!confirm('هل أنت متأكد من تصفير نقاط هذا اللاعب؟')) return;
    
    try {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPoints: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(players.map(p => 
          p.id === playerId ? { ...p, points: data.points } : p
        ));
        if (selectedPlayer?.id === playerId) {
          setSelectedPlayer({ ...selectedPlayer, points: data.points });
        }
        toast({ title: 'تم التصفير', description: 'تم تصفير نقاط اللاعب' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في تصفير النقاط', variant: 'destructive' });
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'overview' as AdminTab, label: 'نظرة عامة', icon: BarChart3 },
    { id: 'players' as AdminTab, label: 'اللاعبين', icon: Users },
    { id: 'settings' as AdminTab, label: 'الإعدادات', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* زر القائمة للموبايل */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => dispatch({ type: 'GO_HOME' })}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-gray-800">لوحة التحكم</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">إدارة النظام</p>
                </div>
              </div>
            </div>
            
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 gap-1 text-xs sm:text-sm">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">أدمن</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 right-0 z-50
            w-64 shrink-0 transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 sticky top-20 sm:top-24 lg:mt-0 mt-14 mr-2">
              <div className="flex items-center justify-between lg:hidden mb-3">
                <span className="font-bold text-gray-800">القائمة</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-l from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: 'اللاعبين', value: stats.totalPlayers, icon: Users, color: 'from-orange-500 to-amber-500' },
                    { label: 'الألعاب', value: stats.totalGames, icon: Gamepad2, color: 'from-green-500 to-emerald-500' },
                    { label: 'النقاط', value: stats.totalPoints, icon: Trophy, color: 'from-purple-500 to-pink-500' },
                    { label: 'المتوسط', value: Math.round(stats.avgScore), icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
                  ].map((stat) => (
                    <Card key={stat.label} className="overflow-hidden border-0 shadow-lg">
                      <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-xl sm:text-3xl font-bold text-gray-800">{stat.value}</p>
                          </div>
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                      أفضل اللاعبين
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-2 sm:space-y-4">
                      {players
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 5)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-gray-50"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{player.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">{player.email}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs sm:text-sm">
                              <Star className="w-3 h-3 mr-1" />
                              {player.points}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Players Tab */}
            {activeTab === 'players' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="ابحث عن لاعب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 sm:pr-12 h-10 sm:h-12 rounded-xl border-0 shadow-md text-sm sm:text-base"
                  />
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">قائمة اللاعبين ({filteredPlayers.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <ScrollArea className="h-[400px] sm:h-[500px]">
                      <div className="space-y-2 sm:space-y-3">
                        {filteredPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold shrink-0 ${
                                player.isBlocked ? 'bg-red-400' : 'bg-gradient-to-br from-orange-400 to-amber-400'
                              }`}>
                                {player.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <p className="font-medium text-sm sm:text-base">{player.name}</p>
                                  {player.isAdmin && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                      <Crown className="w-3 h-3 mr-1" />
                                      أدمن
                                    </Badge>
                                  )}
                                  {player.isBlocked && (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                                      <Ban className="w-3 h-3 mr-1" />
                                      محظور
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{player.email}</p>
                                <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-400">
                                  <span>النقاط: {player.points}</span>
                                  <span className="hidden sm:inline">الألعاب: {player.gameRecords?.length || 0}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2 justify-end">
                              {/* عرض التفاصيل */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedPlayer(player);
                                  setShowPlayerModal(true);
                                }}
                                className="hover:bg-blue-100 h-8 w-8 sm:h-10 sm:w-10"
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4 text-blue-500" />
                              </Button>
                              
                              {/* حظر */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (player.isBlocked) {
                                    handleToggleBlock(player.id, true);
                                  } else {
                                    const reason = prompt('سبب الحظر (اختياري):');
                                    handleToggleBlock(player.id, false, reason || undefined);
                                  }
                                }}
                                className="hover:bg-red-100 h-8 w-8 sm:h-10 sm:w-10"
                                title={player.isBlocked ? 'فك الحظر' : 'حظر'}
                              >
                                <Ban className={`w-4 h-4 ${player.isBlocked ? 'text-green-500' : 'text-red-500'}`} />
                              </Button>
                              
                              {/* أدمن */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleAdmin(player.id, player.isAdmin)}
                                className="hover:bg-purple-100 h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <Shield className={`w-4 h-4 ${player.isAdmin ? 'text-purple-600' : 'text-gray-400'}`} />
                              </Button>
                              
                              {/* حذف */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlayer(player.id)}
                                className="hover:bg-red-100 text-red-500 h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-3 sm:space-y-4">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                      إعدادات النظام
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                    {/* سعر الصورة الرمزية */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-l from-orange-50 to-amber-50 border border-orange-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm sm:text-base">سعر الصورة الرمزية</p>
                            <p className="text-xs sm:text-sm text-gray-500">النقاط المطلوبة لشراء صورة رمزية</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={avatarPrice}
                            onChange={(e) => setAvatarPrice(Number(e.target.value))}
                            className="w-20 sm:w-24 text-center text-base sm:text-lg font-bold"
                            min={1}
                          />
                          <button
                            onClick={handleSaveAvatarPrice}
                            disabled={isSavingAvatarPrice}
                            className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                              savedAvatarPrice 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gradient-to-l from-orange-500 to-amber-500 text-white hover:shadow-lg active:scale-95'
                            }`}
                          >
                            {isSavingAvatarPrice ? (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : savedAvatarPrice ? (
                              <>
                                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">تم الحفظ</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>حفظ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* نقاط الإجابة الصحيحة */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-l from-purple-50 to-pink-50 border border-purple-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm sm:text-base">نقاط الإجابة الصحيحة</p>
                            <p className="text-xs sm:text-sm text-gray-500">النقاط المكتسبة لكل إجابة صحيحة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={pointsPerAnswer}
                            onChange={(e) => setPointsPerAnswer(Number(e.target.value))}
                            className="w-20 sm:w-24 text-center text-base sm:text-lg font-bold"
                            min={1}
                          />
                          <button
                            onClick={handleSavePointsPerAnswer}
                            disabled={isSavingPointsPerAnswer}
                            className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                              savedPointsPerAnswer 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gradient-to-l from-purple-500 to-pink-500 text-white hover:shadow-lg active:scale-95'
                            }`}
                          >
                            {isSavingPointsPerAnswer ? (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : savedPointsPerAnswer ? (
                              <>
                                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">تم الحفظ</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>حفظ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal تفاصيل اللاعب */}
      {showPlayerModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-6 text-white rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center text-xl sm:text-2xl font-bold">
                    {selectedPlayer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold truncate">{selectedPlayer.name}</h2>
                    <p className="text-white/80 text-sm sm:text-base truncate">{selectedPlayer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlayerModal(false)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* معلومات */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500">النقاط</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{selectedPlayer.points}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500">عدد الألعاب</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{selectedPlayer.gameRecords?.length || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500">تاريخ التسجيل</p>
                  <p className="text-base sm:text-lg font-bold text-gray-800">
                    {new Date(selectedPlayer.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500">الحالة</p>
                  <p className={`text-base sm:text-lg font-bold ${selectedPlayer.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedPlayer.isBlocked ? 'محظور' : 'نشط'}
                  </p>
                </div>
              </div>

              {/* إدارة النقاط */}
              <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">إدارة النقاط</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="number"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(Number(e.target.value))}
                    className="w-16 sm:w-20 text-sm sm:text-base"
                    min={1}
                  />
                  <Button
                    onClick={() => handleAddPoints(selectedPlayer.id, pointsAmount)}
                    className="bg-green-500 hover:bg-green-600 text-sm"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    إضافة
                  </Button>
                  <Button
                    onClick={() => handleRemovePoints(selectedPlayer.id, pointsAmount)}
                    className="bg-red-500 hover:bg-red-600 text-sm"
                    size="sm"
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    خصم
                  </Button>
                  <Button
                    onClick={() => handleResetPoints(selectedPlayer.id)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 text-sm"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    تصفير
                  </Button>
                </div>
              </div>

              {/* آخر الألعاب */}
              {selectedPlayer.gameRecords && selectedPlayer.gameRecords.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">آخر الألعاب</h3>
                  <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {selectedPlayer.gameRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div>
                          <span className="font-medium text-sm">{record.gameType}</span>
                          <span className="text-xs sm:text-sm text-gray-500 mr-2">جدول {record.tableNumber}</span>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="text-green-500">{record.correct} صح</span>
                          <span className="mx-1">|</span>
                          <span className="text-red-500">{record.wrong} خطأ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أزرار الحظر */}
              <div className="flex gap-2">
                {selectedPlayer.isBlocked ? (
                  <Button
                    onClick={() => {
                      handleToggleBlock(selectedPlayer.id, true);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    فك الحظر
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const reason = prompt('سبب الحظر (اختياري):');
                      if (reason !== null) {
                        handleToggleBlock(selectedPlayer.id, false, reason || undefined);
                      }
                    }}
                    variant="destructive"
                    className="flex-1 text-sm"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    حظر الحساب
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
