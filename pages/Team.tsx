
import React from 'react';
import { ArrowUpRight, Crown, Star, Smile } from 'lucide-react';

const TEAM_MEMBERS = {
    director: { name: 'Hua', title: '設計總監', color: 'bg-brand-black text-white' },
    manager: { name: 'Jodice', title: '視覺設計經理', color: 'bg-brand-yellow text-brand-black' },
    seniors: [
        { name: 'Hedy', title: '資深視覺設計' },
        { name: 'Penny', title: '資深視覺設計' },
        { name: 'Ina', title: '資深視覺設計' },
        { name: 'Pin', title: '資深視覺設計' },
    ],
    designers: [
        'Ann', 'Amber', 'Haku', 'Linda', 'Wendy', 
        'Kelly', 'Kuei', 'Lily', 'Haruko', 'Aura'
    ]
};

const Team: React.FC = () => {
  return (
    <main className="max-w-7xl mx-auto min-h-screen relative px-4 sm:px-6 lg:px-8 pb-20 animate-fade-in transition-colors duration-300">
        
        {/* Header */}
        <div className="pt-12 pb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 dark:border-gray-800 mb-12">
            <div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-brand-black dark:text-white leading-[1.1] mb-4 transition-colors">
                Creative<br/>Minds
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-md ml-1 transition-colors">
                    認識 HHG 背後的靈魂人物。<br/>
                    一群熱愛設計與創新的視覺團隊。
                </p>
            </div>
            <div className="hidden md:block">
                 <div className="bg-white dark:bg-brand-dark-card px-6 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-brand-dark-card flex items-center justify-center text-xs font-bold ${i%2===0 ? 'bg-brand-yellow text-brand-black' : 'bg-brand-black dark:bg-white text-white dark:text-black'}`}>
                                {i === 4 ? '+' : ''}
                            </div>
                        ))}
                    </div>
                    <div>
                        <span className="block text-2xl font-black leading-none text-brand-black dark:text-white">16</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">Team Members</span>
                    </div>
                 </div>
            </div>
        </div>

        {/* Leadership Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Director */}
            <div className="group relative overflow-hidden rounded-[2rem] bg-brand-black dark:bg-white p-10 text-white dark:text-brand-black min-h-[300px] flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Crown size={120} />
                </div>
                <div>
                    <span className="inline-block px-3 py-1 bg-white/20 dark:bg-black/10 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/10 dark:border-black/5">
                        LEADERSHIP
                    </span>
                    <h2 className="text-4xl font-black tracking-tight mb-1">{TEAM_MEMBERS.director.name}</h2>
                    <p className="text-white/60 dark:text-black/60 font-medium">{TEAM_MEMBERS.director.title}</p>
                </div>
                <div className="flex justify-between items-end">
                    <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-brand-black font-black text-xl">
                        {TEAM_MEMBERS.director.name[0]}
                    </div>
                    <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Manager */}
            <div className="group relative overflow-hidden rounded-[2rem] bg-brand-yellow p-10 text-brand-black min-h-[300px] flex flex-col justify-between shadow-xl shadow-brand-yellow/20 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star size={120} />
                </div>
                <div>
                    <span className="inline-block px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-black/5">
                        MANAGEMENT
                    </span>
                    <h2 className="text-4xl font-black tracking-tight mb-1">{TEAM_MEMBERS.manager.name}</h2>
                    <p className="text-brand-black/60 font-medium">{TEAM_MEMBERS.manager.title}</p>
                </div>
                <div className="flex justify-between items-end">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-black font-black text-xl">
                        {TEAM_MEMBERS.manager.name[0]}
                    </div>
                    <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>

        {/* Seniors Section */}
        <div className="mb-12">
            <h3 className="text-xl font-black text-brand-black dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <span className="w-2 h-8 bg-brand-black dark:bg-white rounded-full"></span>
                資深視覺設計 Senior Designers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {TEAM_MEMBERS.seniors.map((member) => (
                    <div key={member.name} className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-brand-yellow dark:hover:border-brand-yellow hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-8">
                             <div className="w-12 h-12 bg-gray-50 dark:bg-black/30 rounded-full flex items-center justify-center font-bold text-gray-400 group-hover:bg-brand-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                {member.name[0]}
                            </div>
                        </div>
                        <h4 className="text-2xl font-bold text-brand-black dark:text-white mb-1 transition-colors">{member.name}</h4>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Senior Visual</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Designers Section */}
        <div>
            <h3 className="text-xl font-black text-brand-black dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <span className="w-2 h-8 bg-brand-yellow rounded-full"></span>
                視覺設計 Visual Designers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {TEAM_MEMBERS.designers.map((name, index) => (
                    <div key={name} className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all text-center group cursor-default">
                        <div className="w-10 h-10 mx-auto bg-gray-50 dark:bg-black/30 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 mb-3 group-hover:scale-110 group-hover:bg-brand-yellow/20 group-hover:text-brand-black dark:group-hover:text-brand-yellow transition-all">
                             <Smile size={18} />
                        </div>
                        <h4 className="text-lg font-bold text-brand-black dark:text-white transition-colors">{name}</h4>
                        <p className="text-sm text-gray-400 font-bold uppercase mt-1">Designer</p>
                    </div>
                ))}
            </div>
        </div>

    </main>
  );
};

export default Team;
