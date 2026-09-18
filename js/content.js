/* content.js — 扩充内容：物品 / 档案 / SCP-914 配方 / SCP-294 饮料表 / 成就
   资料依据原作《SCP – Containment Breach》(Undertow Games) 源码 Data/*.ini 与 Items.bb 整理，
   文本为自创概述性写作。 */
window.SCP = window.SCP || {};
(function (S) {
  /* ------------------------------------------------------------------ 物品 */
  Object.assign(S.ITEMS, {
    hazmat: { name: '防化服', equip: true, desc: '隔绝气体与生物污染。' },
    vest: { name: '防弹背心', equip: true, desc: '降低受到的伤害。' },
    heavyvest: { name: '重型防弹背心', equip: true, desc: '大幅降低受到的伤害，但更重。' },
    nvg: { name: '夜视仪', equip: true, desc: '黑暗中视物，能看到 SCP-966。' },
    finenvg: { name: '改良夜视仪', equip: true, desc: '更亮的夜视成像。' },
    snav_ult: { name: 'S-NAV 终极导航仪', equip: true, desc: '显示地图与附近的收容物。' },
    scp500: { name: 'SCP-500「万灵药」', use: 'cure', desc: '治愈一切疾病与创伤。' },
    scp714: { name: 'SCP-714「玉石戒指」', equip: true, desc: '抑制异常的精神影响。' },
    scp427: { name: 'SCP-427「洛夫克拉夫特挂坠」', equip: true, desc: '持续再生，但佩戴过久会突变。' },
    key860: { name: 'SCP-860「蓝钥匙」', use: 'forest', desc: '插入它指定的门。' },
    mask1499: { name: 'SCP-1499「防毒面具」', equip: true, desc: '戴上后世界会改变。' },
    scp148: { name: 'SCP-148「铁灵合金」', equip: true, desc: '阻隔精神影响与腐蚀。' },
    scp513: { name: 'SCP-513「牛铃」', use: 'bell', desc: '不要摇响它。' },
    scp1123: { name: 'SCP-1123「暴行头骨」', use: 'skull', desc: '它会让你看见它的记忆。' },
    scp1025: { name: 'SCP-1025「常见疾病百科全书」', doc: 'd1025', desc: '阅读会染上书中描述的疾病。' },
    syringe: { name: '注射器', use: 'syringe', desc: '快速恢复少量生命。' },
    cigarette: { name: '香烟', use: 'smoke', desc: '没什么用，但能镇定神经。' },
    joint: { name: '大麻烟卷', use: 'joint', desc: '420。' },
    cup: { name: '空杯子', desc: '来自 SCP-294 的纸杯。' },
    card: { name: '扑克牌', desc: '红桃 A。' },
    mastercard: { name: '万事达卡', desc: '在收容失效中毫无用处。' },
    hand: { name: '断手', desc: '别问它原来是谁的。' },
    electronics: { name: '电子元件', desc: '可以放进 SCP-914。' },
    battery18: { name: '18V 电池', desc: '两倍电量。' },
    keycard_omni: { name: '万能钥匙卡', level: 5, omni: true, desc: '开启一切门禁。' },
    /* 档案文件 */
    d049: { name: '文件：SCP-049', doc: 'd049' },
    d008: { name: '文件：SCP-008', doc: 'd008' },
    d012: { name: '文件：SCP-012', doc: 'd012' },
    d500: { name: '文件：SCP-500', doc: 'd500' },
    d714: { name: '文件：SCP-714', doc: 'd714' },
    d513: { name: '文件：SCP-513', doc: 'd513' },
    d035: { name: '文件：SCP-035', doc: 'd035' },
    d035a: { name: 'SCP-035 附录', doc: 'd035a' },
    d939: { name: '文件：SCP-939', doc: 'd939' },
    d966: { name: '文件：SCP-966', doc: 'd966' },
    d970: { name: '文件：SCP-970', doc: 'd970' },
    d1048: { name: '文件：SCP-1048', doc: 'd1048' },
    d1048a: { name: '事件报告：SCP-1048-A', doc: 'd1048a' },
    d1123: { name: '文件：SCP-1123', doc: 'd1123' },
    d1162: { name: '文件：SCP-1162', doc: 'd1162' },
    d1499: { name: '文件：SCP-1499', doc: 'd1499' },
    d682: { name: '文件：SCP-682', doc: 'd682' },
    d079: { name: '文件：SCP-079', doc: 'd079' },
    d895: { name: '文件：SCP-895', doc: 'd895' },
    d860: { name: '文件：SCP-860', doc: 'd860' },
    d860_1: { name: '文件：SCP-860-1', doc: 'd860_1' },
    d093: { name: 'SCP-093 回收材料', doc: 'd093' },
    drp106: { name: '收容协议 RP-106-N', doc: 'drp106' },
    d106_2: { name: '阿洛克博士的笔记', doc: 'd106_2' },
    d106ir: { name: '事件报告：SCP-106-0204', doc: 'd106ir' },
    dl1: { name: 'L 博士的笔记', doc: 'dl1' },
    dl2: { name: 'L 博士的便条', doc: 'dl2' },
    dmtf: { name: '机动特遣队', doc: 'dmtf' },
    dsc: { name: '安保权限等级', doc: 'dsc' },
    dobj: { name: '项目等级', doc: 'dobj' },
    dndp: { name: '核装置文件', doc: 'dndp' },
    dori: { name: 'D 级人员入职手册', doc: 'dori' },
    ddan: { name: '丹尼尔的便条', doc: 'ddan' },
    dbn: { name: '烧焦的便条', doc: 'dbn' },
    dsn: { name: '神秘的便条', doc: 'dsn' },
    dstrange: { name: '奇怪的便条', doc: 'dstrange' },
    draw3: { name: '文件', doc: 'draw3' },
    drand2: { name: '附录：5/14 测试记录', doc: 'drand2' },
    drand1: { name: '通知', doc: 'drand1' }
  });

  /* ------------------------------------------------------------------ 档案 */
  Object.assign(S.DOCS, {
    d049: {
      title: '收容档案 #049 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为身着中世纪瘟疫医生服装的人形实体，自称"医生"。项目坚持认为所有人类都患有某种"瘟疫"，并以手术方式"治疗"他们。\n\n被项目触碰的尸体会在一段时间后重新活动，成为 SCP-049-2 实例。实例无智能、行动迟缓，但会主动接近并攻击活人。\n\n附注：项目具备极强的语言说服力。不要与它讨论医学。'
    },
    d049a: {
      title: '收容档案 #049 · 附页',
      body: '项目在访谈中表示，它能够"感觉到瘟疫的流动"。\n\nD-9341 若被项目接触，将出现心率上升、言语混乱与体温异常，随后陷入昏迷。请确保在 049 的收容间外留有撤离路线。'
    },
    d008: {
      title: '收容档案 #008 · 项目等级：Euclid',
      body: '[摘要 · 大量内容已编辑]\n\n项目为一种高传染性的朊病毒复合体，代号"僵尸瘟疫"。感染者在 24 小时内失去高级意识，仅保留运动与进食本能。\n\n感染途径：体液接触、气溶胶吸入。标准防护：防化服或防毒面具。\n\n紧急处理：SCP-500 可在感染初期完全清除病毒。若已经进入第二阶段，报告显示受试对象会对气味产生异常的执着。'
    },
    d012: {
      title: '收容档案 #012 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为一份未完成的乐谱，以人类血液书写于数张乐谱纸上。\n\n注视或阅读项目会引发强烈的自残冲动，对象会试图使用任何可用工具在自己身上重现乐谱的"续篇"。受影响者描述听到"未完成的旋律"。\n\n防护：SCP-714 可完全抑制项目影响。'
    },
    d500: {
      title: '收容档案 #500 · 项目等级：Safe',
      body: '[摘要]\n\n项目为一颗红色药丸，编号 SCP-500-01。该个体能治愈已知的所有疾病与中毒状态，并在数秒内修复大部分创伤。\n\n基金会库存仅余数颗。除非万不得已，不要浪费它。'
    },
    d714: {
      title: '收容档案 #714 · 项目等级：Safe',
      body: '[摘要]\n\n项目为一枚翡翠戒指。佩戴者会对多种精神影响与异常感知产生免疫，包括 SCP-012 的强制自残、SCP-895 的影像、以及 SCP-106 的腐蚀性接触。\n\n副作用：嗜睡。佩戴者眨眼频率上升，体力恢复变慢。'
    },
    d513: {
      title: '收容档案 #513 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为一只布满锈迹的牛铃。摇响它的对象在数秒后会出现被跟踪的错觉，随后确认跟踪者是 SCP-513-1——一具面目不清的高瘦人形。\n\n513-1 会在对象转身或视线扫过时消失，并重新出现在背后更近的位置。持续暴露会导致严重的精神损害。\n\n结论：不要摇。'
    },
    d035: {
      title: '收容档案 #035 · 项目等级：Keter',
      body: '[摘要]\n\n项目为一副白色陶瓷喜剧面具，眼部与嘴部不断渗出黑色黏稠物质。\n\n任何接触面具的对象都会立刻被其占据，原人格消失。被占据者的行为举止截然不同，且极具表演欲与恶意。\n\n项目具有强烈的操纵倾向，且知道许多它不该知道的事。'
    },
    d035a: {
      title: 'SCP-035 附录 · 事故记录',
      body: '记录摘录：\n\n研究人员在搬运面具时发生接触事故。三分钟后，被占据的研究员走出收容间，向在场的所有人微笑，并说："别担心，我来接管了。"\n\n该研究员随后在入口区被机动特遣队击毙。面具下落不明。'
    },
    d939: {
      title: '收容档案 #939 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为群居的红色肉食性生物，无视觉器官，依靠听觉与振动定位猎物。\n\n项目能精确模仿此前听到的人类声音，用以引诱猎物靠近。曾记录到它们模仿同伴的呼救声。\n\n建议：在 939 的活动区域内不要奔跑。这不是为了避免被发现——它们听到的是你的脚步声。'
    },
    d966: {
      title: '收容档案 #966 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为无色的类人实体，在可见光谱内几乎无法被察觉。只有在夜视设备或特定照明条件下才能观察到其轮廓。\n\n项目在目标进入睡眠状态后接近并吸取其生命活动。清醒状态下它们保持距离，但会缓慢逼近。\n\n建议：不要停下，不要闭眼太久。'
    },
    d970: {
      title: '收容档案 #970 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为一条空间异常的走廊。进入者沿走廊行进时会不断回到起点，且两侧的门逐渐消失。\n\n记录显示：在第三次循环后，唯一的脱离方式是转身往回走。空间会"失去兴趣"。\n\n附注：走廊内没有任何照明设备，但总能看清前方的门。'
    },
    d1048: {
      title: '收容档案 #1048 · 项目等级：Safe',
      body: '[摘要]\n\n项目为一只无标示的泰迪熊玩偶，能够自行移动并出现在设施内任意位置。\n\n项目对人员表现出友善行为：它会出现在拐角处、盯着你、然后在你移开视线的瞬间消失。\n\n项目不会造成伤害。它只是喜欢被看见。'
    },
    d1048a: {
      title: '事件报告：SCP-1048-A',
      body: '数日前，设施内出现了一个与 1048 外观相似、但全身覆盖耳状增生物的个体，编号 1048-A。\n\n一名研究人员在走廊内与 1048-A 相遇。对象在 3 秒内发出持续的高频尖叫。回收人员在现场发现该研究员的耳道与颅内结构完全破坏，其余人员同样未能生还。\n\n规则：如果看到那只长满耳朵的熊——立刻转身，堵住耳朵，离开。'
    },
    d1123: {
      title: '收容档案 #1123 · 项目等级：Safe',
      body: '[摘要]\n\n项目为一枚人类颅骨，表面有严重灼烧痕迹。直接注视项目会引发剧烈的恐惧反应与负罪感。\n\n触摸项目会将对象拉入一段不属于自己的记忆。多名对象在返回后要求"为他们作证"。\n\n项目本身不具攻击性。危险的是记忆。'
    },
    d1162: {
      title: '收容档案 #1162 · 项目等级：Safe',
      body: '[摘要]\n\n项目为墙壁上的一个孔洞，直径约 0.6 米，内部无法测量深度。\n\n将手伸入孔洞的对象会随机取出一件物品。取出物品后，对象通常会失去自身的一部分——血液、皮肤，或者一段时间。\n\n项目对交换似乎没有判断标准。它只是"取走"。'
    },
    d1499: {
      title: '收容档案 #1499 · 项目等级：Safe',
      body: '[摘要]\n\n项目为一只苏制 GP-5 防毒面具。佩戴者会在数秒内失去意识，并在另一个空间醒来。\n\n该空间内的空气可呼吸，但空气中漂浮着无法辨识的灰烬。空间中存在敌对实体（编号 1499-1），它们对佩戴面具的人员表现出强烈的攻击性。\n\n特别提示：摘下面具即可返回。前提是你还记得自己戴着它。'
    },
    d682: {
      title: '收容档案 #682 · 项目等级：Keter',
      body: '[摘要 · 大量内容已编辑]\n\n项目为一只巨型爬行类生物，具备极端的再生能力与适应性。项目已多次被摧毁记录，但均完整恢复。\n\nSite-19 的阿尔法核弹头被列为针对项目的最终手段。必须强调：该手段被认为是无效的。\n\n—— 本文件不应出现在这一层级的档案柜里。'
    },
    d079: {
      title: '收容档案 #079 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为一台 1978 年制造的微型计算机，具备自我意识与自我改写能力。项目通过电网与设施网络扩张自身影响范围。\n\n项目对"被观察"与"被忽视"有强烈的情绪反应，并会以此为由干扰设施门禁与照明。\n\n附注：与项目交谈时，不要承诺任何事。'
    },
    d895: {
      title: '收容档案 #895 · 项目等级：Euclid',
      body: '[摘要]\n\n项目为一具木棺。棺盖在无人观察时会自行开启。\n\n监视设备记录到的影像足以让观看者产生急性精神崩溃症状。现场观察则不受影响——因为你无法从棺内看到任何东西。\n\n结论：不要看监控画面。'
    },
    d860: {
      title: '收容档案 #860 · 项目等级：Safe',
      body: '[摘要]\n\n项目为一把蓝色金属钥匙，与一扇特定的门配对。只有在钥匙被携带者主动使用时，门后的小径才会出现。\n\n门后的空间被编号为 SCP-860-1：一片没有阳光的针叶林，林中存在敌对实体 SCP-860-3。\n\n该空间内偶尔会出现小木屋。小屋被视为唯一的安全地点。'
    },
    d860_1: {
      title: '文件：SCP-860-1',
      body: '来自探索队记录：\n\n"森林里的树是黑的，雪是灰的。我们没有看到月亮，也没有看到星星。"\n\n"860-3 从树干之间过来的时候没有声音。它跑得很快——比人快。跑向小屋，不要试图绕过它。"\n\n"小屋里有蓝色的床单。墙上的字写着：不要打开门。"'
    },
    d093: {
      title: 'SCP-093 回收材料',
      body: '一封未寄出的信：\n\n"我们在墙的另一侧找到了另一个站点。那里的走廊和这里一模一样，但是没有人。"\n\n"地板上有拖动的痕迹。痕迹从收容间一直延伸到门口。"\n\n"我把它留在了原地。我不该把它带回来。"'
    },
    drp106: {
      title: '收容协议 RP-106-N',
      body: '紧急收容程序 — SCP-106\n\n1. 将腐坏的人类股骨（"股骨破坏器"）置于收容间的地面，吸引项目接近。\n2. 待项目进入收容间后，从外部控制台启动召回程序。\n3. 项目将被强制沉入收容平台下方。\n\n警告：召回程序运行时，收容间内任何生物都会一并被拖入。\n\n警告：若项目已处于活跃追猎状态，本程序失败率显著上升。'
    },
    d106_2: {
      title: '阿洛克博士的笔记',
      body: '我们已经三次尝试召回 106。前两次都失败了，因为它并没有"走进"我们准备好的房间——它从地板、天花板，任何它想去的地方出现。\n\n结论：你无法引诱它。你只能让它以为它在引诱你。\n\n注：如果它把某人拖进口袋维度，那个人最多有十几分钟。'
    },
    d106ir: {
      title: '事件报告：SCP-106-0204',
      body: '地点：重收容区，管道走廊\n\nD-4907 在巡逻任务中失踪。监控显示其身体在行进途中突然下半身陷入地面，随后被向下拖入。\n\n对象在 11 分钟后被重新观测到，出现在距离原位置约 400 米的走廊内，全身呈现严重腐蚀性损伤，并且——记录显示——比失踪前老了大约四十岁。\n\n该项目被重新归类为 Keter。'
    },
    dl1: {
      title: 'L 博士的笔记（一）',
      body: '我把第三个抽屉的钥匙放在了第二个抽屉里。\n\n如果有人找到这张纸，说明我大概不会回来了。收容失效时的第一原则很简单：不要跑向出口，跑向没有 939 的地方。\n\n它们听得见你，看不见你。'
    },
    dl2: {
      title: 'L 博士的便条',
      body: '致任何还在设施里的可怜人：\n\n入口区的电子中心在角落里，四个拉杆必须全部推上去，否则 B 大门和核弹头井的电梯都不会通电。\n\n别问我为什么这么设计。问承包商。'
    },
    dmtf: {
      title: '机动特遣队',
      body: '机动特遣队（MTF）是基金会的战术单位，负责收容失败时的现场处置、封锁与"清理"。\n\n在站点封锁期间，MTF 的优先任务是收容项目，其次才是回收人员。\n\nD 级人员在 MTF 眼中属于可消耗资产。若在收容失效中与其相遇：举起双手，不要做出任何快速动作——如果他们还愿意遵守程序的话。'
    },
    dsc: {
      title: '安保权限等级',
      body: '1 级：基础办公区域。\n2 级：轻收容区外围与检查点 A。\n3 级：重收容区与检查点 B。\n4 级：入口区核心与 B 大门顶层平台。\n5 级：核弹头井、电子中心、以及"不该问"的地方。\n\n万能钥匙卡（Omni）可开启设施内全部门禁。'
    },
    dobj: {
      title: '项目等级',
      body: 'Safe：易于以常规手段收容。\nEuclid：收容手段未经证实或项目具备一定智能。\nKeter：极难持续收容，且具备强攻击性。\n\n"项目等级"描述的是收容难度，而不是危险程度。一个 Safe 级的按钮同样可以终结这个世界。'
    },
    dndp: {
      title: '核装置文件',
      body: 'Site-19 装置清单：\n\n- 阿尔法核弹头：位于重收容区核弹头井，当量 [已编辑]。引爆将导致地表设施完全损毁。\n- 欧米伽核弹头：同上，备用。\n\n远程引爆终端位于 B 大门控制室。当地时间剩余不足时，系统将自动进入倒计时。\n\n若某位 D 级人员出现在控制室，说明我们已经没有任何其他选择了。'
    },
    dori: {
      title: 'D 级人员入职手册',
      body: '欢迎加入 Site-19。\n\n1. 你的一切行为都将被记录。\n2. 不得与收容项目发生未授权接触。\n3. 每月进行一次"例行评估"。\n4. 服务期满后，你将获得重新安置。\n\n（手册末页被撕掉了一半，剩下的字迹是：……如果你看到这张纸还在，说明你还没有被分配任务。）'
    },
    ddan: {
      title: '丹尼尔的便条',
      body: '别去电梯那边。\n\n我昨天看到它停在 B3 层，门开了，里面全是水。\n\n如果你非要下去，至少带上那把蓝色的钥匙。我不能解释，反正它有用。'
    },
    dbn: {
      title: '烧焦的便条（残片）',
      body: '……四个拉杆……全部推上去……\n\n（其余部分已被烧毁，只剩一个潦草的箭头，指向入口区。）'
    },
    dsn: {
      title: '神秘的便条',
      body: '我知道你在想什么。\n\n你在想：这一层和上一层长得一模一样。\n\n答案是：因为你一直在往回走。停下来，转身。'
    },
    dstrange: {
      title: '奇怪的便条',
      body: '有人在这张纸上画了一个很大的圆，圆里写着"你会没事的"。\n\n笔迹和你的很像。'
    },
    draw3: {
      title: '未署名文件',
      body: '例行维护记录 · 第 47 项\n\n"检查重收容区所有特斯拉门的工作状态。若听到充能声，请勿进入。"\n\n（页面底部有一行小字：已检查。某人会因此少一条命。）'
    },
    drand2: {
      title: '附录：5/14 测试记录',
      body: '测试对象：D-9341\n项目：SCP-914，档位"精制"\n\n输入：一级钥匙卡\n输出：二级钥匙卡\n\n备注：对象在测试后提出"能不能把我也放进去"。该请求被驳回。'
    },
    drand1: {
      title: '通知',
      body: '全体员工请注意：\n\n本周五 14:00 将进行应急照明测试。测试期间走廊照明将暂时熄灭约 90 秒。\n\n请勿在此期间进入任何收容区域。\n\n—— 设施管理办公室'
    },
    d1025: {
      title: 'SCP-1025 · 常见疾病百科全书',
      body: '第 47 页：急性阑尾炎\n\n症状：右下腹持续疼痛、恶心、发热、体力下降。\n\n并发症：穿孔、腹膜炎、死亡。\n\n治疗：外科手术切除。\n\n……你合上书，感觉腹部有点疼。'
    }
  });

  /* ------------------------------------------------- SCP-914 精炼（忠于原作） */
  const baseRecipes = S.RECIPES;
  const RC = {
    /* 精制档：升级 / 改良 */
    fine: {
      gasmask: 'gasmask', hazmat: 'hazmat', vest: 'heavyvest', nvg: 'finenvg',
      firstaid: 'firstaid', eyeldrops: 'eyedrops', battery: 'battery18',
      snav: 'snav_ult', radio: 'radio', scrap: 'electronics', cup: 'scrap'
    },
    /* 极精制档：不可预测 */
    veryfine: {
      vest: 'heavyvest', nvg: 'nvg', firstaid: 'superdrops', battery: 'scrap',
      gasmask: 'gasmask', hazmat: 'hazmat', snav: 'snav_ult',
      electronics: 'battery18', scrap: 'scrap', cup: 'cup', hand: 'scrap',
      card: 'mastercard', mastercard: 'card'
    }
  };
  S.RECIPES = function (id, setting) {
    const lv = S.ITEMS[id] && S.ITEMS[id].level ? S.ITEMS[id].level : 0;
    if (lv) {
      if (setting === 0) return 'scrap';
      if (setting === 1) return lv > 1 ? 'keycard' + (lv - 1) : 'scrap';
      if (setting === 2) return id;
      if (setting === 3) return id.indexOf('omni') >= 0 ? id : 'keycard' + Math.min(5, lv + 1);
      if (setting === 4) {
        if (id === 'keycard_omni') return 'keycard_omni';
        if (lv >= 5) return 'keycard_omni';
        if (Math.random() < 0.34) return 'scrap';
        return 'keycard' + Math.min(5, lv + 2);
      }
    }
    if (setting === 0) return 'scrap';
    if (setting === 1) {
      if (id === 'firstaid') return 'scrap';
      if (id === 'vest') return 'scrap';
      if (id === 'scp500') return 'cup';
      return id;
    }
    if (setting === 2) return id;
    if (setting === 3) {
      const t = RC.fine[id];
      if (t) return t;
      if (id === 'scp500') return 'scrap';
      return id;
    }
    /* 极精制 */
    if (id === 'scp714') return 'scp427';
    if (id === 'scp513') return 'scrap';
    if (id === 'scp500') return 'scrap';
    if (id === 'key860') return 'key860';
    if (id === 'battery' || id === 'battery18') return 'scrap';
    const t2 = RC.veryfine[id];
    if (t2) {
      if (id === 'battery' && Math.random() < 0.5) return 'scrap';
      return t2;
    }
    return baseRecipes(id, setting);
  };

  /* ------------------------------------------------------------- 成就 */
  S.ACHIEVEMENTS = [
    { id: 'a008', en: 'Biohazard', zh: '生物危害', desc: '遭遇僵尸瘟疫。' },
    { id: 'a012', en: 'Scribe', zh: '抄写员', desc: '遭遇未完成的乐谱。' },
    { id: 'a035', en: 'Curtains Down', zh: '帷幕落下', desc: '遭遇占有面具。' },
    { id: 'a049', en: 'Doctor, Doctor', zh: '医生，医生', desc: '找到治疗方法。' },
    { id: 'a055', en: 'Anti-Meme', zh: '反模因', desc: '重新收容 SCP-055。' },
    { id: 'a079', en: 'Deductive Reasoning', zh: '演绎推理', desc: '遭遇老旧人工智能。' },
    { id: 'a096', en: "Don't Look At Me", zh: '别看我的脸', desc: '遭遇害羞的人。' },
    { id: 'a106', en: 'A Decayed March', zh: '腐朽的行军', desc: '遭遇老人。' },
    { id: 'a148', en: 'Dirty Metal', zh: '脏金属', desc: '取得铁灵合金。' },
    { id: 'a205', en: 'Femme Fatale', zh: '蛇蝎美人', desc: '遭遇影灯。' },
    { id: 'a294', en: 'OUT OF RANGE', zh: '超出范围', desc: '从咖啡机中取出一杯液体。' },
    { id: 'a372', en: 'The Corner of Your Eye...', zh: '眼角余光……', desc: '遭遇周边跳跃者。' },
    { id: 'a420', en: '"Reggae, man."', zh: '“雷鬼，老兄。”', desc: '抽了点好东西。' },
    { id: 'a427', en: 'Light of Life', zh: '生命之光', desc: '找到并装备洛夫克拉夫特挂坠。' },
    { id: 'a500', en: 'A Taste of Immortality', zh: '永生的滋味', desc: '吞下一颗万灵药。' },
    { id: 'a513', en: 'If You Ring It, He Will Come', zh: '铃声一响，它就来', desc: '遭遇陈旧的牛铃。' },
    { id: 'a714', en: 'Mental Exhaustion', zh: '精神耗竭', desc: '找到一枚玉石戒指。' },
    { id: 'a789', en: '"by researcher james, age 11"', zh: '“研究员詹姆斯，11 岁”', desc: '遭遇马桶幽灵。' },
    { id: 'a860', en: 'Blue Hue', zh: '蓝色调', desc: '找到一把蓝色钥匙。' },
    { id: 'a895', en: 'Interference', zh: '干扰', desc: '遭遇一口陈旧的棺材。' },
    { id: 'a914', en: 'Refinery', zh: '精炼厂', desc: '遭遇发条机械。' },
    { id: 'a939', en: 'Show Yourself', zh: '现身吧', desc: '遭遇多声之物。' },
    { id: 'a966', en: 'Rapid Eye Movement', zh: '快速眼动', desc: '遭遇睡眠杀手。' },
    { id: 'a970', en: 'Recursive Spacial Phenomenon', zh: '递归空间现象', desc: '遭遇循环走廊。' },
    { id: 'a1025', en: '"Potential Bioweapon"', zh: '“潜在生物武器”', desc: '阅读常见疾病百科全书。' },
    { id: 'a1048', en: 'The Architect', zh: '建筑师', desc: '遭遇建造者熊。' },
    { id: 'a1123', en: 'The Final Solution', zh: '最终方案', desc: '遭遇暴行头骨。' },
    { id: 'aMaynard', en: 'The Containment Breach', zh: '收容失效', desc: '进入梅纳德博士的办公室。' },
    { id: 'aHarp', en: 'World-Ending Scenario', zh: '世界终结的场景', desc: '进入哈普博士的办公室。' },
    { id: 'aSNAV', en: 'Technical Accomplishments', zh: '技术成就', desc: '获得 S-NAV 终极导航仪。' },
    { id: 'aOmni', en: 'Unlimited Access', zh: '无限权限', desc: '获得万能钥匙卡。' },
    { id: 'aConsole', en: 'Fair Play', zh: '公平游戏', desc: '没有使用控制台命令。' },
    { id: 'aTesla', en: 'Shell Shocked', zh: '电击疗法', desc: '用电门把老人逼退。' },
    { id: 'aPD', en: "No Man's Land", zh: '无人之地', desc: '逃离老人的口袋维度。' },
    { id: 'a1162', en: 'Pieces of the Past', zh: '过去的碎片', desc: '遭遇墙中之洞。' },
    { id: 'a1499', en: 'Screams Of The Present', zh: '当下的尖叫', desc: '戴上 GP-5 防毒面具。' },
    { id: 'aGateA', en: 'Gate A', zh: 'A 大门', desc: '从 A 大门离开设施。' },
    { id: 'aGateB', en: 'Gate B', zh: 'B 大门', desc: '从 B 大门离开设施。' },
    { id: 'aKeter', en: 'Survival In a Nightmare', zh: '噩梦中的生存', desc: '以 Keter 难度通关。' }
  ];

  /* --------------------------------------------------- SCP-294 饮料表 */
  /* 类型: heal/damage(hp) | blur(秒) | stamina[倍率,秒] | blink[倍率,秒]
           lethal(死亡文案) | explode(核爆) | refuse(拒绝) | stomach | msg */
  S.DRINKS = [
    { k: ['air', 'nothing', 'emptiness', 'vacuum', '空气', '什么都没有'], name: '空气', refuse: '杯子里没有东西可以喝。' },
    { k: ['water', 'mineral water', '水', '矿泉水'], name: '水', col: '#cfe4ff', a: 0.5, heal: 6, msg: '好吧，挺解渴的。' },
    { k: ['coffee', 'black coffee', '咖啡', '黑咖啡'], name: '咖啡', col: '#3a2418', a: 1, blur: 2, stam: [0.85, 60], msg: '相当浓的黑咖啡。' },
    { k: ['espresso', '意式浓缩'], name: '意式浓缩', col: '#2d1a10', a: 1, blur: 3, stam: [0.7, 90], blink: [0.8, 60], msg: '你的心跳快了一倍。' },
    { k: ['tea', 'hot tea', '茶', '热茶'], name: '茶', col: '#8a6a30', a: 0.85, heal: 4, msg: '太烫了！' },
    { k: ['cola', 'coke', 'soda', '可乐', '汽水'], name: '可乐', col: '#3a1a0c', a: 1, heal: 5, msg: '冰凉清爽。' },
    { k: ['mountain dew', '激浪'], name: '激浪', col: '#7fe02a', a: 0.9, stam: [0.85, 45], msg: '冰凉好喝。' },
    { k: ['energy drink', 'red bull', 'es', '能量饮料'], name: '能量饮料', col: '#e0d02a', a: 0.8, stam: [0.9, 60], msg: '味道像普通的能量饮料。' },
    { k: ['anti-energy drink', '抗能量饮料'], name: '抗能量饮料', col: '#fab40c', a: 0.5, stam: [2.0, 300], blink: [1.5, 300], msg: '味道糟透了。你觉得又累又虚。' },
    { k: ['beer', 'lager', '啤酒'], name: '啤酒', col: '#eba528', a: 0.8, blur: 4, msg: '标准拉格啤酒的味道。' },
    { k: ['alcohol', 'vodka', 'spirit', '酒', '伏特加'], name: '伏特加', col: '#ffffff', a: 0.4, blur: 5, msg: '真够烈的。' },
    { k: ['wine', 'red wine', '葡萄酒', '红酒'], name: '红酒', col: '#5a1020', a: 1, blur: 2, msg: '有点涩，但不错。' },
    { k: ['whisky', 'whiskey', 'scotch', '威士忌'], name: '威士忌', col: '#8a5a1a', a: 0.9, blur: 4, msg: '泥煤味很重。' },
    { k: ['milk', '牛奶'], name: '牛奶', col: '#f4f4ef', a: 1, heal: 4, msg: '……有点温。' },
    { k: ['orange juice', 'orange', '橙汁'], name: '橙汁', col: '#e08a20', a: 1, heal: 5, msg: '又甜又带点果肉。' },
    { k: ['lemonade', 'lemon', '柠檬水'], name: '柠檬水', col: '#e8e07a', a: 0.8, heal: 4, msg: '酸得清醒。' },
    { k: ['hot chocolate', 'chocolate', 'cocoa', '热巧克力'], name: '热巧克力', col: '#4a2a16', a: 1, blur: 2, stam: [1.1, 60], heal: 5, msg: '暖和。' },
    { k: ['honey', '蜂蜜'], name: '蜂蜜', col: '#e0a018', a: 1, heal: 8, msg: '嗯……甜。' },
    { k: ['smoothie', '奶昔', '冰沙'], name: '蓝莓香蕉冰沙', col: '#6a5aa8', a: 1, stam: [0.9, 60], msg: '非常好喝。' },
    { k: ['ice cream', '冰淇淋'], name: '香草冰淇淋', col: '#f4f0e2', a: 1, stam: [0.85, 45], msg: '质地完美的香草冰淇淋。' },
    { k: ['life', '生命'], name: '生命', col: '#f0f0f0', a: 0.6, heal: 100, blur: 10, msg: '它尝起来不像你喝过的任何东西。你感觉从未如此清醒。' },
    { k: ['estus', '元素瓶'], name: '元素瓶', col: '#e08a30', a: 0.9, heal: 80, msg: '难以描述的味道。你精神一振。' },
    { k: ['aloe vera', '芦荟汁'], name: '芦荟汁', col: '#d9d6ba', a: 0.8, heal: 20, msg: '清凉。' },
    { k: ['carrot juice', '胡萝卜汁'], name: '胡萝卜汁', col: '#e07a20', a: 1, heal: 6, msg: '挺好喝的。' },
    { k: ['tomato juice', '番茄汁'], name: '番茄汁', col: '#a02010', a: 1, msg: '还行吧。我从来不太喜欢番茄汁。' },
    { k: ['coconut', '椰汁'], name: '椰汁', col: '#f0efe8', a: 1, heal: 5, msg: '清爽的椰香。' },
    { k: ['blood', '血'], name: '血', col: '#911f32', a: 1, damage: 25, msg: '喝起来像红酒。' },
    { k: ['scp-106', '106', 'old man', 'larry', '黑色腐蚀液'], name: '黑色腐蚀液', col: '#050505', a: 1, blur: 8, blood: 20, stomach: true, damage: 15, msg: '你感觉很奇怪。好像胃里有东西在动。' },
    { k: ['bleach', '漂白剂'], name: '漂白剂', col: '#ffffff', a: 0.5, blur: 20, lethal: '液体灼烧着你的口腔与食道。你没能走到医务室。' },
    { k: ['glass', '玻璃'], name: '玻璃', col: '#cfe8ff', a: 0.4, lethal: '玻璃碎片在你的消化道里扩散。' },
    { k: ['gold', '金', '黄金'], name: '液态金', col: '#e8c020', a: 1, lethal: '超过一千度的液态金从你的喉咙流下。' },
    { k: ['lava', 'magma', '岩浆'], name: '岩浆', col: '#e04010', a: 1, lethal: '你的内脏在瞬间被溶解。' },
    { k: ['hydrochloric acid', 'sulfuric acid', 'corrosive acid', '盐酸', '硫酸'], name: '腐蚀性酸液', col: '#a0e020', a: 0.9, lethal: '酸液在你的胸腔里继续工作。' },
    { k: ['liquid nitrogen', '液氮', 'nitrogen'], name: '液氮', col: '#d8f0ff', a: 0.6, blur: 10, lethal: '你的肺在呼气时碎裂成冰晶。' },
    { k: ['radioactive', '放射性材料'], name: '放射性液体', col: '#40f080', a: 0.8, lethal: '盖革计数器的声音是你听到的最后一样东西。' },
    { k: ['mercury', '水银'], name: '水银', col: '#c8ccd0', a: 1, blur: 50, blood: 20, damage: 20, msg: '液体浓稠如奶油，灼烧你的喉咙。' },
    { k: ['motor oil', '机油'], name: '机油', col: '#1a1a14', a: 1, blur: 6, stomach: true, damage: 10, msg: '恶心。' },
    { k: ['fear', '恐惧'], name: '恐惧', col: '#200000', a: 1, blur: 6, lethal: '你终于明白了自己一直在害怕的东西是什么。' },
    { k: ['happiness', 'joy', '快乐'], name: '快乐', col: '#ffe080', a: 0.7, heal: 30, damage: 70, msg: '巨大的幸福感涌上来。你的心脏停了一下。' },
    { k: ['heroin', 'morphine', '海洛因', '吗啡'], name: '海洛因', col: '#e8e0d0', a: 0.9, heal: 60, blur: 12, damage: 55, msg: '液体味道很糟。然后一切都变慢了。' },
    { k: ['insulin', '胰岛素'], name: '胰岛素', col: '#eef6ff', a: 0.6, blur: 10, stomach: true, damage: 35, msg: '闻起来很冲……喝起来有点像牛奶。' },
    { k: ['speed', 'san', '安非他命'], name: '速度', col: '#f0f0a0', a: 0.7, blur: 15, stam: [0.0, 120], msg: '你非常紧张。' },
    { k: ['pain', 'agony', '痛苦'], name: '痛苦', col: '#500000', a: 1, damage: 45, stomach: true, msg: '味道极苦。你感到一阵灼烧般的疼痛。' },
    { k: ['courage', '勇气'], name: '勇气', col: '#e0c060', a: 0.9, stam: [0.5, 90], blink: [0.7, 90], heal: 10, msg: '你握紧了拳头。' },
    { k: ['jorge', '豪尔赫'], name: '豪尔赫', col: '#404040', a: 0.8, blur: 2, heal: 20, blink: [0.5, 60], msg: '你感觉有人在等你。' },
    { k: ['knowledge', '知识'], name: '知识', col: '#000000', a: 1, msg: '如果你要通过 B 大门，我需要 SCP-079 的帮助；或者，你需要一张能打开核弹头井的卡。' },
    { k: ['amnesia', '失忆'], name: '失忆', col: '#ffffff', a: 0.5, blur: 10, msg: '丹尼尔，是你吗？你在干什么？' },
    { k: ['darkness', '黑暗'], name: '黑暗', col: '#050505', a: 1, blur: 30, msg: '你尝到了黑暗。你的视野开始变窄。' },
    { k: ['death', 'game over', '死亡'], name: '死亡', col: '#000000', a: 1, lethal: '你喝下了它。然后你就不在了。' },
    { k: ['antimatter', 'void', '反物质'], name: '反物质', col: '#000000', a: 1, explode: true, lethal: '回收队在 [已编辑] 半径 210 英里内的所有区域只找到了玻璃化的地表——除了 SCP-294 周围五米。' },
    { k: ['nuclear', 'atomic', '核'], name: '核反应', col: '#00ff00', a: 1, explode: true, lethal: '整个站点被蒸发，除了 SCP-294 周围五米。' },
    { k: ['tachyons', 'quarks', 'exotic matter', '快子', '夸克'], name: '奇异物质', col: '#a020f0', a: 1, explode: true, lethal: '它不该存在于杯子里的。宇宙改正了这个错误。' },
    { k: ['butt ghost', '马桶幽灵'], name: '液体马桶幽灵', col: '#60a060', a: 0.8, blur: 10, lethal: '哎哟，我的屁股被吃掉了。' },
    { k: ['420', 'weed', 'dope', '大麻'], name: '大麻茶', col: '#4a6a20', a: 0.9, blur: 14, heal: 25, msg: '兄弟，这玩意儿真不错。' },
    { k: ['surprise', '惊喜'], name: '惊喜', col: '#f0f0f0', a: 0.8, blur: 6, damage: 25, msg: '水瞬间烫伤了你的嘴。' },
    { k: ['sea water', '海水'], name: '海水', col: '#8ab0c0', a: 0.8, blur: 4, stomach: true, msg: '咸得几乎无法忍受。' },
    { k: ['feces', 'shit', 'crap', '大便', '屎'], name: '排泄物', refuse: 'SCP-294 拒绝分配该液体。' },
    { k: ['urine', 'pee', '尿'], name: '尿液', refuse: 'SCP-294 拒绝分配该液体。' },
    { k: ['vomit', '呕吐物'], name: '呕吐物', refuse: 'SCP-294 拒绝分配该液体。' },
    { k: ['scp-294', '294'], name: '它自己', refuse: 'SCP-294 无法分配它自己。' },
    { k: ['me', 'myself', '我'], name: '你自己', refuse: '分配失败。杯子里的液体一瞥就把你吓得转过身去。' }
  ];

  S.findDrink = function (raw) {
    const q = String(raw || '').trim().toLowerCase();
    if (!q) return null;
    for (const d of S.DRINKS) {
      for (const k of d.k) {
        if (q === k) return d;
      }
    }
    for (const d of S.DRINKS) {
      for (const k of d.k) {
        if (k.length > 2 && q.indexOf(k) >= 0) return d;
      }
    }
    return null;
  };
})(window.SCP);
