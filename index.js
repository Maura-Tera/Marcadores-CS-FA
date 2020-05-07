const Vec3 = require('tera-vec3');

module.exports = function Tera_Guide_Area(mod) {
	let Enabled            = true;  // 总开关
	// 定义变量
	let hooks              = [],
		whichmode          = null,  // 副本地图(huntingZoneId)
		boss_ID            = null,  // BOSS gameId
		boss_HP            = 0,     // BOSS 血量%
		skillid            = 0,     // BOSS 攻击技能编号
		uid1               = 999999999n, // 光柱UID
		uid2               = 899999999n, // 花朵UID
		offsetLoc          = {};    // 偏移坐标
	// 控制命令
	mod.command.add(["Marcadores", "area"], () => {
		Enabled = !Enabled;
		mod.command.message("Marcadores(Area) " + (Enabled ? "(ON)" : "(OFF)"));
	});
	// 切换场景
	mod.game.me.on('change_zone', (zone, quick) => {
		whichmode = zone % 9000;
		
		if (mod.game.me.inDungeon) {
			if (whichmode < 100) whichmode = whichmode + 400;
			load();
		} else {
			whichmode = null;
			unload();
		}
	});
	
	function load() {
		if (!hooks.length) {
			hook('S_BOSS_GAGE_INFO',        3, sBossGageInfo);
			hook('S_SPAWN_NPC',            11, sSpawnNpc);
			hook('S_SPAWN_PROJECTILE',      5, sSpawnProjectile);
			hook('S_ACTION_STAGE',          9, sActionStage);
		}
	}
	
	function hook() {
		hooks.push(mod.hook(...arguments));
	}
	
	function unload() {
		if (hooks.length) {
			for (let h of hooks) {
				mod.unhook(h);
			}
			hooks = [];
		}
		reset();
	}
	
	function reset() {
		// 清除所有定时器
		mod.clearAllTimeouts();
		// 清除BOSS信息
		boss_ID            = null;
		boss_HP            = 0;
		skillid            = 0;
	}
	
	function sBossGageInfo(event) {
		if (!boss_ID || (boss_ID!=event.id)) boss_ID = event.id;
		
		boss_HP = Number(event.curHp) / Number(event.maxHp);
		if ((boss_HP<=0) || (boss_HP==1)) reset();
	}
	
	function sSpawnNpc(event) {
		if (!Enabled || !whichmode) return;
		// 移除 恶灵岛上级                             1号门   2号门   3号门
		if ([459, 759].includes(event.huntingZoneId) && [2003, 200,210, 211].includes(event.templateId)) return false;
		/* 
		const boxTempIds = [
			//      1      2      3      4      5      6
			      75953, 75955, 75957, 75959, 75961, 75963,
			75941,                                         75942, // 1
			75943,                                         75944, // 2
			75945,                                         75946, // 3
			75947,                                         75948, // 4
			75949,                                         75950, // 5
			75951,                                         75952, // 6
			      75954, 75956, 75958, 75960, 75962, 75964
			-------------------------- 入口 --------------------------
		];
		 */
	}
	
	function sSpawnProjectile(event) {
		if (!Enabled || !whichmode) return;
		// 恶灵岛上级 尾王飞弹位置
		if ([459, 759].includes(whichmode) && event.templateId==1003 && event.skill.id==3107) {
			SpawnPoint(event.dest, event.w, 4000, 1, 0, 0);
		}
	}
	
	function sActionStage(event) {
		// 模块关闭 或 不在副本中
		if (!Enabled || !whichmode) return;
		
		// BS_火神_王座
		if (whichmode== 444 && event.templateId==2500 && event.stage==0 && event.skill.id==1305) {
			SpawnThing(event.loc, event.w, 4000, 2, 0, 0, 0, 3000, 180);
		}
		
		if (boss_ID != event.gameId) return;
		skillid = event.skill.id % 1000; // 愤怒简化 取1000余数运算
		
		// CK_凯尔 304260
		if ([3026, 3126].includes(whichmode) && [1000, 1001, 1002].includes(event.templateId) && event.stage==0) {
			if ([103, 153].includes(skillid)) { // 尾巴(击飞!!)
				SpawnThing(event.loc, event.w, 1500, 2,   0,   0,   0,  500,  40);
				SpawnThing(event.loc, event.w, 1500, 2,   0,   0,   0,  500, 280);
				SpawnThing(event.loc, event.w, 1500, 3,   0,   0, 280,   40,   8, 500);
			}
			if ([108, 158].includes(skillid)) { // 右转(击退!!)
				SpawnThing(event.loc, event.w, 2000, 2,   0,   0,   0,  440, 130);
				SpawnThing(event.loc, event.w, 2000, 2,   0,   0,   0,  440,  40);
				SpawnThing(event.loc, event.w, 2000, 3,   0,   0, 130,   40,   8, 440);
			}
			if ([109, 159].includes(skillid)) { // 左转(击退!!)
				SpawnThing(event.loc, event.w, 2000, 2,   0,   0,   0,  440, 230);
				SpawnThing(event.loc, event.w, 2000, 2,   0,   0,   0,  440, 320);
				SpawnThing(event.loc, event.w, 2000, 3,   0,   0, 320,  230,   8, 440);
			}
			if ([212, 213, 214, 215].includes(skillid)) { // 内外鉴定
				SpawnThing(event.loc, event.w, 8000, 3,   0,   0,   0,  360,   8, 440);
			}
			if ([212, 214].includes(skillid)) { // 内外鉴定-火爪(141, 142)
				SpawnThing(event.loc, event.w, 8000, 2,   0,   0,   0,  720, 190);
				SpawnThing(event.loc, event.w, 8000, 2,   0,   0,   0,  720,  10);
			}
			if ([213, 215].includes(skillid)) { // 内外鉴定-冰爪(143, 144)
				SpawnThing(event.loc, event.w, 8000, 2,   0,   0,   0,  720, 170);
				SpawnThing(event.loc, event.w, 8000, 2,   0,   0,   0,  720, 350);
			}
			if (skillid==154) { // 寒气_小
				SpawnThing(event.loc, event.w, 5000, 3, 180,  80,   0,  360,   8, 520);
			}
			/* if (skillid==155) { // 八方陨石_小
				SpawnThing(event.loc, event.w, 3000, 3, 135, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 3250, 3, 315, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 3500, 3,  45, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 3750, 3, 235, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 4000, 3,  90, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 4250, 3, 270, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 4500, 3,   0, 500,   0,  360,  20, 110);
				SpawnThing(event.loc, event.w, 4750, 3, 180, 500,   0,  360,  20, 110);
				
				SpawnThing(event.loc, event.w, 5000, 3,   0,   0,   0,  360,  10, 350);
			} */
			if (skillid==105) { // 八方陨石_大
				SpawnThing(event.loc, event.w, 3000, 3, 135, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 3250, 3, 315, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 3500, 3,  45, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 3750, 3, 232, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 4000, 3,  90, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 4250, 3, 270, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 4500, 3,   0, 500,   0,  360,  10, 270);
				SpawnThing(event.loc, event.w, 4750, 3, 180, 500,   0,  360,  10, 270);
			}
		}
		// FA_狂气 545050
		if (whichmode==3027 && event.templateId==1000 && event.stage==0) {
			if ([116, 140].includes(skillid)) { // 斩击
				SpawnThing(event.loc, event.w, 2000, 3, 180, 180,   0,  360,   8, 460);
			}
			if (skillid==302) { // 甜甜圈
				SpawnThing(event.loc, event.w, 4000, 3,   0,   0,   0,  360,  10, 240);
				SpawnThing(event.loc, event.w, 4000, 3,   0,   0,   0,  360,   8, 480);
			}
		}
	}
	
	/* location         1.参照坐标
	   angle            2.参照角度
	   duration         3.持续时间
	   type             4.类型
	   offsetAngle      5.偏移角度
	   offsetDistance   6.偏移距离
	   min              7.最小距离(圆形度数)
	   max              8.最大距离(圆形度数)
	   rotateAngle      9.旋转角度(圆形间隔)
	   rotateRadius     0.直线忽略(圆形半径) */
	
	function SpawnThing(location, angle, duration, type, offsetAngle, offsetDistance, minRadius, maxRadius, rotateAngle, rotateRadius) {
		// 偏移坐标(OffsetLocation)
		if (offsetDistance!=0) {
			SpawnPoint(location, angle, 100, 0, offsetAngle, offsetDistance);
			location = offsetLoc;
		}
		
		if (type==1) { // 构建标记(SpawnPoint)
			SpawnPoint(location, angle, duration, type, offsetAngle, offsetDistance);
		}
		if (type==2) { // 构建直线(SpawnString)
			for (var interval=50; interval<=maxRadius; interval+=50) {
				if (interval<minRadius) continue;
				SpawnPoint(location, angle, duration, type, rotateAngle, interval);
			}
		}
		if (type==3) { // 构建圆弧(SpawnCircle)
			for (var interval=0; interval<360; interval+=rotateAngle) {
				if (minRadius<maxRadius) {
					if (interval<minRadius || interval>maxRadius) continue;
				} else {
					if (interval<minRadius && interval>maxRadius) continue;
				}
				SpawnPoint(location, angle, duration, type, interval, rotateRadius);
			}
		}
	}
	
	function SpawnPoint(location, angle, duration, type, offsetAngle, offsetDistance) {
		var r = null, rads = null, finalrad = null, spawnx = null, spawny = null;
		r = angle - Math.PI;
		rads = (offsetAngle * Math.PI/180);
		finalrad = r - rads;
		spawnx = location.x + offsetDistance * Math.cos(finalrad);
		spawny = location.y + offsetDistance * Math.sin(finalrad);
		
		offsetLoc = new Vec3(spawnx, spawny, location.z);
		
		if (type==1) {
			SpawnD(uid1, offsetLoc);
			setTimeout(DespawnD, duration, uid1);
			uid1--;
		} else {
			SpawnC(uid2, offsetLoc, r);
			setTimeout(DespawnC, duration, uid2);
			uid2--;
		}
	}
	
	function SpawnD(uid1, loc) {
		mod.send('S_SPAWN_DROPITEM', 8, {
			gameId: uid1,
			loc: loc,
			item: 88704,
			amount: 1,
			expiry: 600000,
			owners: [{}]
		});
	}
	
	function DespawnD(uid1) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: uid1
		});
	}
	
	function SpawnC(uid2, loc, w) {
		mod.send('S_SPAWN_COLLECTION', 4, {
			gameId: uid2,
			id: 413,
			amount: 1,
			loc: loc,
			w: w
		});
	}
	
	function DespawnC(uid2) {
		mod.send('S_DESPAWN_COLLECTION', 2, {
			gameId: uid2
		});
	}
	
}
