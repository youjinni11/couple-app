// 화면 문구 사전 (한국어 / English / 中文)
export const LANGS = [
  { id: 'ko', name: '한국어' },
  { id: 'en', name: 'English' },
  { id: 'zh', name: '中文' },
];

const D = {
  ko: {
    appName: '우리둘', loading: '불러오는 중…', notFound: '없는 화면이에요.', goHome: '홈으로', back: '뒤로', delete: '삭제',
    partner: '짝꿍', save: '저장', close: '닫기', today: '오늘', logout: '로그아웃',
    'err.invalidLogin': '이메일 또는 비밀번호가 맞지 않아요',
    'err.alreadyRegistered': '이미 가입된 이메일이에요. 로그인해주세요',
    'err.pwShort': '비밀번호는 6자 이상이어야 해요',
    'err.ALREADY_PAIRED': '이미 짝꿍과 연결되어 있어요',
    'err.CODE_NOT_FOUND': '초대 코드를 찾을 수 없어요',
    'err.COUPLE_FULL': '이미 두 명이 연결된 코드예요',
    'err.notifDenied': '알림 권한이 꺼져 있어요. 설정 › 알림 › 우리둘에서 켜주세요.',
    'err.titleRequired': '제목을 적어주세요',

    'login.tagline': '둘이 하고 싶은 것, 해낸 것, 나눈 마음을 한곳에.',
    'login.nickname': '내 이름 (짝꿍에게 보일 이름)', 'login.nickPh': '예: 유진',
    'login.email': '이메일', 'login.password': '비밀번호',
    'login.signup': '가입하기', 'login.login': '로그인',
    'login.toSignup': '처음이에요 · 가입하기', 'login.toLogin': '이미 계정이 있어요 · 로그인',

    'pair.title': '{name}님, 짝꿍과 연결해요',
    'pair.startTitle': '내가 먼저 시작하기', 'pair.startDate': '사귀기 시작한 날 (나중에 바꿀 수 있어요)',
    'pair.makeCode': '초대 코드 만들기', 'pair.joinTitle': '짝꿍에게 받은 코드 입력',
    'pair.codePh': '6자리 코드', 'pair.join': '연결하기',

    'home.waiting': '짝꿍 기다리는 중', 'home.together': '우리가 함께한 지', 'home.daysUnit': '일째',
    'home.since': '{date}부터', 'home.setDate': '사귀기 시작한 날을 정해주세요', 'home.setDateBtn': '날짜 정하기',
    'home.shareCode': '짝꿍에게 이 코드를 알려주세요', 'home.copyCode': '코드 복사', 'home.copied': '코드를 복사했어요',
    'home.pushHint': '알림을 켜면 짝꿍의 쪽지·답변을 바로 받아요',
    'home.addHomeHint': '홈 화면에 추가하면 알림을 받을 수 있어요',
    'home.upcoming': '다가오는 날', 'home.openMemories': '📷 우리의 추억 기록장 열기', 'seeAll': '전체 보기',

    'ev.days': '{n}일', 'ev.years': '{n}주년', 'ev.firstDay': '사귀기 시작한 날',

    'q.todayKicker': '오늘의 속마음', 'q.meDone': '나 답함', 'q.meNot': '나 아직', 'q.youDone': '짝꿍 답함', 'q.youNot': '짝꿍 아직',
    'q.answerPh': '솔직한 마음을 적어주세요', 'q.answer': '답하기', 'q.saveEdit': '고친 답 저장', 'q.edit': '고치기',
    'q.locked': '🔒 짝꿍은 이미 답했어요. 나도 답하면 볼 수 있어요.',
    'q.waiting': '아직 답하지 않았어요. 답하면 알림으로 알려드릴게요.',
    'q.homeTitle': '속마음 문답', 'q.history': '지난 문답', 'q.historyEmpty': '둘이 답한 질문이 여기에 쌓여요.',
    'q.bucketKicker': '버킷리스트 질문', 'q.defaultBucket': '이걸 함께하면서 가장 기억에 남는 순간은 언제였어?',

    'bucket.title': '버킷리스트', 'bucket.progress': '{total}개 중 {done}개 해냈어요', 'bucket.pickFromIdeas': '추천에서 골라 담기',
    'bucket.tabTodo': '하고 싶은 것', 'bucket.tabDone': '해낸 것', 'bucket.pick': '추천에서 고르기', 'bucket.write': '직접 쓰기',
    'bucket.addPh': '둘이 해보고 싶은 것', 'bucket.add': '담기', 'bucket.added': '버킷리스트에 담았어요',
    'bucket.emptyTodo': '아직 담은 버킷리스트가 없어요. 추천에서 골라보세요.',
    'bucket.emptyDone': '해낸 버킷리스트가 여기에 모여요.',
    'bucket.doneOn': '{date} 달성', 'bucket.missing': '삭제됐거나 찾을 수 없는 항목이에요.',
    'bucket.confirmDelete': '이 버킷리스트를 지울까요?', 'bucket.addedBy': '{name}님이 담았어요',
    'bucket.didIt': '함께 해냈나요?', 'bucket.doneDate': '한 날', 'bucket.markDone': '해냈어요', 'bucket.doneToast': '🎉 해냈어요!',
    'bucket.doneBanner': '🎉 {date}에 해냈어요', 'bucket.undo': '아직 안 했어요로 되돌리기',
    'bucket.diaryEmpty': '이 버킷리스트의 순간을 사진으로 남겨보세요.',
    'pick.title': '추천 버킷리스트', 'pick.all': '전체', 'pick.addMark': '+ 담기', 'pick.addedMark': '담음', 'pick.toast': '{emoji} 담았어요',

    'cat.일상': '일상', 'cat.요리': '요리', 'cat.기록': '기록', 'cat.여행': '여행', 'cat.마음': '마음', 'cat.취미': '취미',
    'cat.추억': '추억', 'cat.놀이': '놀이', 'cat.건강': '건강', 'cat.만들기': '만들기', 'cat.문화': '문화', 'cat.계절': '계절', 'cat.직접 추가': '직접 추가',

    'diary.section': '사진 일기', 'diary.write': '쓰기', 'diary.newTitle': '사진 일기 쓰기',
    'diary.addPhotos': '＋ 사진 추가 (최대 10장)', 'diary.removePhoto': '사진 빼기', 'diary.date': '날짜',
    'diary.titleLabel': '제목', 'diary.titlePh': '오늘의 한 줄', 'diary.body': '이야기', 'diary.bodyPh': '그날 있었던 일, 기분, 나눈 말',
    'diary.saving': '올리는 중…', 'diary.save': '기록하기', 'diary.saved': '추억을 기록했어요',
    'diary.missing': '삭제됐거나 찾을 수 없는 기록이에요.', 'diary.confirmDelete': '이 기록을 지울까요? 사진도 함께 지워져요.',
    'best.mine': '★ 나의 최고의 순간', 'best.add': '☆ 최고의 순간으로', 'best.theirs': '★ 짝꿍의 최고의 순간',
    'mem.title': '추억 기록장', 'mem.all': '전체', 'mem.mine': '나의 최고', 'mem.theirs': '짝꿍의 최고',
    'mem.empty': '아직 기록이 없어요.', 'mem.first': '첫 기록 남기기', 'mem.bestEmpty': '일기에서 ☆를 누르면 여기에 모여요.', 'mem.writeAria': '일기 쓰기',

    'notes.title': '쪽지', 'notes.empty': '짧은 쪽지로 마음을 전해보세요. 60자까지 쓸 수 있어요.',
    'notes.read': '읽음', 'notes.ph': '짝꿍에게 쪽지', 'notes.send': '보내기',
    'time.now': '방금', 'time.min': '{n}분 전', 'time.hour': '{n}시간 전',

    'cal.title': '달력', 'cal.prev': '이전 달', 'cal.next': '다음 달', 'cal.recordDay': '이날 기록',
    'cal.nthDay': '함께한 지 {n}일째 되는 날', 'cal.bucketDone': '{emoji} {title} 달성', 'cal.empty': '아직 기록이 없는 날이에요.',
    'anniv.title': '기념일', 'anniv.add': '추가', 'anniv.ph': '예: 짝꿍 생일', 'anniv.yearly': '매년 반복',
    'anniv.addBtn': '기념일 추가', 'anniv.confirmDelete': '이 기념일을 지울까요?', 'anniv.deleteAria': '기념일 삭제',

    'set.title': '설정', 'set.name': '내 이름', 'set.nameSaved': '이름을 바꿨어요',
    'set.language': '언어', 'set.languageHint': '화면, 추천 버킷리스트, 오늘의 질문, 나에게 오는 알림이 이 언어로 바뀌어요. 짝꿍은 자기 언어로 봐요.',
    'set.font': '글씨체', 'set.size': '글자 크기', 'set.sample': '우리 둘이 함께 채워요',
    'size.0': '작게', 'size.1': '보통', 'size.2': '크게', 'size.3': '더 크게', 'size.4': '가장 크게',
    'set.sizePreview': '오늘 하루 중 가장 좋았던 순간은 언제였어?',
    'set.notif': '알림', 'set.ios1': '사파리 아래쪽 공유 버튼(네모에서 화살표)을 눌러요', 'set.ios2': '홈 화면에 추가를 눌러요',
    'set.ios3': '홈 화면의 우리둘 아이콘으로 다시 열고 여기서 알림을 켜요',
    'set.denied': '알림이 차단돼 있어요. 아이폰 설정 › 알림 › 우리둘에서 허용해주세요.',
    'set.notifOn': '알림 켜기', 'set.notifOff': '알림 끄기', 'set.notifOnToast': '알림을 켰어요', 'set.notifOffToast': '알림을 껐어요',
    'set.test': '테스트 알림 보내기', 'set.testSent': '테스트 알림을 보냈어요. 앱을 닫고 기다려보세요',
    'set.notifDesc': '쪽지, 질문 답변, 새 기록, 버킷리스트 달성 때 알려드리고, 매일 밤 9시에 오늘의 질문을 알려드려요. 알림을 누르면 그 화면으로 바로 열려요.',
    'set.us': '우리', 'set.startDate': '사귀기 시작한 날', 'set.dateSaved': '날짜를 저장했어요',
    'set.partner': '짝꿍: {name}', 'set.partnerPending': '아직 연결 전 (초대 코드 {code})',

    'tab.home': '홈', 'tab.bucket': '버킷', 'tab.q': '문답', 'tab.notes': '쪽지', 'tab.cal': '달력',
  },

  en: {
    appName: 'Us Two', loading: 'Loading…', notFound: 'This page doesn’t exist.', goHome: 'Go home', back: 'Back', delete: 'Delete',
    partner: 'Partner', save: 'Save', close: 'Close', today: 'Today', logout: 'Log out',
    'err.invalidLogin': 'Wrong email or password',
    'err.alreadyRegistered': 'This email is already registered. Please log in',
    'err.pwShort': 'Password must be at least 6 characters',
    'err.ALREADY_PAIRED': 'You’re already connected with a partner',
    'err.CODE_NOT_FOUND': 'Invite code not found',
    'err.COUPLE_FULL': 'This code is already used by two people',
    'err.notifDenied': 'Notifications are off. Turn them on in Settings › Notifications › 우리둘.',
    'err.titleRequired': 'Add a title',

    'login.tagline': 'What you want to do, what you’ve done, and what you’ve shared — in one place.',
    'login.nickname': 'Your name (shown to your partner)', 'login.nickPh': 'e.g. Youjin',
    'login.email': 'Email', 'login.password': 'Password',
    'login.signup': 'Sign up', 'login.login': 'Log in',
    'login.toSignup': 'New here? Sign up', 'login.toLogin': 'Already have an account? Log in',

    'pair.title': '{name}, connect with your partner',
    'pair.startTitle': 'Start first', 'pair.startDate': 'The day you started dating (you can change it later)',
    'pair.makeCode': 'Create invite code', 'pair.joinTitle': 'Enter your partner’s code',
    'pair.codePh': '6-character code', 'pair.join': 'Connect',

    'home.waiting': 'Waiting for your partner', 'home.together': 'Together for', 'home.daysUnit': 'days',
    'home.since': 'since {date}', 'home.setDate': 'Set the day you started dating', 'home.setDateBtn': 'Set date',
    'home.shareCode': 'Share this code with your partner', 'home.copyCode': 'Copy code', 'home.copied': 'Code copied',
    'home.pushHint': 'Turn on notifications to get your partner’s notes and answers right away',
    'home.addHomeHint': 'Add to Home Screen to get notifications',
    'home.upcoming': 'Coming up', 'home.openMemories': '📷 Open our memory book', 'seeAll': 'See all',

    'ev.days': '{n} days', 'ev.years': '{n}-year anniversary', 'ev.firstDay': 'Our first day',

    'q.todayKicker': 'Today’s question', 'q.meDone': 'You answered', 'q.meNot': 'You: not yet', 'q.youDone': 'Partner answered', 'q.youNot': 'Partner: not yet',
    'q.answerPh': 'Write what you really feel', 'q.answer': 'Answer', 'q.saveEdit': 'Save changes', 'q.edit': 'Edit',
    'q.locked': '🔒 Your partner already answered. Answer to see theirs.',
    'q.waiting': 'Not answered yet. We’ll notify you when they do.',
    'q.homeTitle': 'Questions', 'q.history': 'Past questions', 'q.historyEmpty': 'Questions you answer will collect here.',
    'q.bucketKicker': 'Bucket list question', 'q.defaultBucket': 'What was the most memorable moment of doing this together?',

    'bucket.title': 'Bucket list', 'bucket.progress': '{done} of {total} done', 'bucket.pickFromIdeas': 'Pick from ideas',
    'bucket.tabTodo': 'To do', 'bucket.tabDone': 'Done', 'bucket.pick': 'Browse ideas', 'bucket.write': 'Write your own',
    'bucket.addPh': 'Something to do together', 'bucket.add': 'Add', 'bucket.added': 'Added to the bucket list',
    'bucket.emptyTodo': 'Nothing here yet. Browse ideas to get started.',
    'bucket.emptyDone': 'Things you’ve done together will collect here.',
    'bucket.doneOn': 'Done {date}', 'bucket.missing': 'This item was deleted or can’t be found.',
    'bucket.confirmDelete': 'Delete this bucket list item?', 'bucket.addedBy': 'Added by {name}',
    'bucket.didIt': 'Did you do it together?', 'bucket.doneDate': 'Date', 'bucket.markDone': 'We did it', 'bucket.doneToast': '🎉 You did it!',
    'bucket.doneBanner': '🎉 Done on {date}', 'bucket.undo': 'Mark as not done',
    'bucket.diaryEmpty': 'Capture this moment with photos.',
    'pick.title': 'Bucket list ideas', 'pick.all': 'All', 'pick.addMark': '+ Add', 'pick.addedMark': 'Added', 'pick.toast': '{emoji} Added',

    'cat.일상': 'Everyday', 'cat.요리': 'Food', 'cat.기록': 'Keepsakes', 'cat.여행': 'Travel', 'cat.마음': 'Heart', 'cat.취미': 'Hobbies',
    'cat.추억': 'Memories', 'cat.놀이': 'Fun', 'cat.건강': 'Health', 'cat.만들기': 'Crafts', 'cat.문화': 'Culture', 'cat.계절': 'Seasons', 'cat.직접 추가': 'Custom',

    'diary.section': 'Photo diary', 'diary.write': 'Write', 'diary.newTitle': 'New photo diary',
    'diary.addPhotos': '+ Add photos (up to 10)', 'diary.removePhoto': 'Remove photo', 'diary.date': 'Date',
    'diary.titleLabel': 'Title', 'diary.titlePh': 'Today in one line', 'diary.body': 'Story', 'diary.bodyPh': 'What happened, how you felt, what you said',
    'diary.saving': 'Uploading…', 'diary.save': 'Save', 'diary.saved': 'Memory saved',
    'diary.missing': 'This entry was deleted or can’t be found.', 'diary.confirmDelete': 'Delete this entry? Its photos will be deleted too.',
    'best.mine': '★ My best moment', 'best.add': '☆ Mark as best moment', 'best.theirs': '★ Partner’s best moment',
    'mem.title': 'Memory book', 'mem.all': 'All', 'mem.mine': 'My best', 'mem.theirs': 'Partner’s best',
    'mem.empty': 'No memories yet.', 'mem.first': 'Write the first one', 'mem.bestEmpty': 'Tap ☆ on an entry to collect it here.', 'mem.writeAria': 'Write an entry',

    'notes.title': 'Notes', 'notes.empty': 'Send a short note. Up to 60 characters.',
    'notes.read': 'Read', 'notes.ph': 'A note for your partner', 'notes.send': 'Send',
    'time.now': 'just now', 'time.min': '{n}m ago', 'time.hour': '{n}h ago',

    'cal.title': 'Calendar', 'cal.prev': 'Previous month', 'cal.next': 'Next month', 'cal.recordDay': 'Write for this day',
    'cal.nthDay': 'Day {n} together', 'cal.bucketDone': '{emoji} {title} done', 'cal.empty': 'Nothing recorded on this day.',
    'anniv.title': 'Anniversaries', 'anniv.add': 'Add', 'anniv.ph': 'e.g. Partner’s birthday', 'anniv.yearly': 'Repeat every year',
    'anniv.addBtn': 'Add anniversary', 'anniv.confirmDelete': 'Delete this anniversary?', 'anniv.deleteAria': 'Delete anniversary',

    'set.title': 'Settings', 'set.name': 'Your name', 'set.nameSaved': 'Name updated',
    'set.language': 'Language', 'set.languageHint': 'Screens, bucket list ideas, daily questions and your notifications switch to this language. Your partner sees their own language.',
    'set.font': 'Font', 'set.size': 'Text size', 'set.sample': 'Filling it up, together',
    'size.0': 'Small', 'size.1': 'Default', 'size.2': 'Large', 'size.3': 'Larger', 'size.4': 'Largest',
    'set.sizePreview': 'What was the best moment of your day?',
    'set.notif': 'Notifications', 'set.ios1': 'Tap the Share button (square with an arrow) at the bottom of Safari', 'set.ios2': 'Tap “Add to Home Screen”',
    'set.ios3': 'Open the app from its Home Screen icon and turn on notifications here',
    'set.denied': 'Notifications are blocked. Allow them in iPhone Settings › Notifications › 우리둘.',
    'set.notifOn': 'Turn on notifications', 'set.notifOff': 'Turn off notifications', 'set.notifOnToast': 'Notifications on', 'set.notifOffToast': 'Notifications off',
    'set.test': 'Send a test notification', 'set.testSent': 'Test sent. Close the app and wait a moment',
    'set.notifDesc': 'You’ll get notified about notes, answers, new memories and finished bucket list items, plus today’s question every evening at 9 pm Korea time. Tapping a notification opens that screen directly.',
    'set.us': 'Us', 'set.startDate': 'The day you started dating', 'set.dateSaved': 'Date saved',
    'set.partner': 'Partner: {name}', 'set.partnerPending': 'Not connected yet (invite code {code})',

    'tab.home': 'Home', 'tab.bucket': 'Bucket', 'tab.q': 'Q&A', 'tab.notes': 'Notes', 'tab.cal': 'Calendar',
  },

  zh: {
    appName: '我们俩', loading: '加载中…', notFound: '页面不存在。', goHome: '回首页', back: '返回', delete: '删除',
    partner: '另一半', save: '保存', close: '关闭', today: '今天', logout: '退出登录',
    'err.invalidLogin': '邮箱或密码不正确',
    'err.alreadyRegistered': '该邮箱已注册，请直接登录',
    'err.pwShort': '密码至少需要6位',
    'err.ALREADY_PAIRED': '你已经和另一半连接了',
    'err.CODE_NOT_FOUND': '找不到这个邀请码',
    'err.COUPLE_FULL': '这个邀请码已经有两个人使用了',
    'err.notifDenied': '通知权限已关闭，请在 设置 › 通知 › 우리둘 中开启。',
    'err.titleRequired': '请填写标题',

    'login.tagline': '想一起做的、做到的、分享的心意，都在这里。',
    'login.nickname': '我的名字（对方看到的名字）', 'login.nickPh': '例：小涵',
    'login.email': '邮箱', 'login.password': '密码',
    'login.signup': '注册', 'login.login': '登录',
    'login.toSignup': '第一次使用？注册', 'login.toLogin': '已有账号？登录',

    'pair.title': '{name}，和另一半连接吧',
    'pair.startTitle': '我先开始', 'pair.startDate': '在一起的日子（之后可以修改）',
    'pair.makeCode': '生成邀请码', 'pair.joinTitle': '输入对方给你的邀请码',
    'pair.codePh': '6位邀请码', 'pair.join': '连接',

    'home.waiting': '等待另一半加入', 'home.together': '我们在一起', 'home.daysUnit': '天',
    'home.since': '从 {date} 开始', 'home.setDate': '设置在一起的日子', 'home.setDateBtn': '设置日期',
    'home.shareCode': '把这个邀请码发给另一半', 'home.copyCode': '复制邀请码', 'home.copied': '已复制邀请码',
    'home.pushHint': '开启通知，第一时间收到对方的纸条和回答',
    'home.addHomeHint': '添加到主屏幕即可接收通知',
    'home.upcoming': '即将到来', 'home.openMemories': '📷 打开我们的回忆册', 'seeAll': '查看全部',

    'ev.days': '{n}天', 'ev.years': '{n}周年', 'ev.firstDay': '在一起的第一天',

    'q.todayKicker': '今日心声', 'q.meDone': '我已回答', 'q.meNot': '我还没答', 'q.youDone': '对方已回答', 'q.youNot': '对方还没答',
    'q.answerPh': '写下你的真心话', 'q.answer': '回答', 'q.saveEdit': '保存修改', 'q.edit': '修改',
    'q.locked': '🔒 对方已经回答了，你回答后就能看到。',
    'q.waiting': '对方还没回答，回答后会通知你。',
    'q.homeTitle': '心声问答', 'q.history': '往期问答', 'q.historyEmpty': '你们回答过的问题会保存在这里。',
    'q.bucketKicker': '心愿问答', 'q.defaultBucket': '一起做这件事时，最难忘的瞬间是什么时候？',

    'bucket.title': '心愿清单', 'bucket.progress': '已完成 {done}/{total}', 'bucket.pickFromIdeas': '从推荐中挑选',
    'bucket.tabTodo': '想做的', 'bucket.tabDone': '已完成', 'bucket.pick': '浏览推荐', 'bucket.write': '自己写',
    'bucket.addPh': '想一起做的事', 'bucket.add': '添加', 'bucket.added': '已加入心愿清单',
    'bucket.emptyTodo': '还没有心愿，去推荐里挑一挑吧。',
    'bucket.emptyDone': '一起完成的心愿会出现在这里。',
    'bucket.doneOn': '{date} 完成', 'bucket.missing': '该心愿已删除或找不到。',
    'bucket.confirmDelete': '要删除这个心愿吗？', 'bucket.addedBy': '{name} 添加的',
    'bucket.didIt': '一起完成了吗？', 'bucket.doneDate': '完成日期', 'bucket.markDone': '完成啦', 'bucket.doneToast': '🎉 完成啦！',
    'bucket.doneBanner': '🎉 {date} 完成', 'bucket.undo': '改回未完成',
    'bucket.diaryEmpty': '用照片记录这一刻吧。',
    'pick.title': '推荐心愿', 'pick.all': '全部', 'pick.addMark': '+ 添加', 'pick.addedMark': '已添加', 'pick.toast': '{emoji} 已添加',

    'cat.일상': '日常', 'cat.요리': '美食', 'cat.기록': '记录', 'cat.여행': '旅行', 'cat.마음': '心意', 'cat.취미': '爱好',
    'cat.추억': '回忆', 'cat.놀이': '玩乐', 'cat.건강': '健康', 'cat.만들기': '手作', 'cat.문화': '文化', 'cat.계절': '季节', 'cat.직접 추가': '自定义',

    'diary.section': '照片日记', 'diary.write': '写', 'diary.newTitle': '写照片日记',
    'diary.addPhotos': '＋ 添加照片（最多10张）', 'diary.removePhoto': '移除照片', 'diary.date': '日期',
    'diary.titleLabel': '标题', 'diary.titlePh': '今天的一句话', 'diary.body': '故事', 'diary.bodyPh': '那天发生的事、心情、说过的话',
    'diary.saving': '上传中…', 'diary.save': '保存', 'diary.saved': '回忆已保存',
    'diary.missing': '该记录已删除或找不到。', 'diary.confirmDelete': '要删除这条记录吗？照片也会一起删除。',
    'best.mine': '★ 我的最佳瞬间', 'best.add': '☆ 设为最佳瞬间', 'best.theirs': '★ 对方的最佳瞬间',
    'mem.title': '回忆册', 'mem.all': '全部', 'mem.mine': '我的最佳', 'mem.theirs': '对方的最佳',
    'mem.empty': '还没有记录。', 'mem.first': '写下第一篇', 'mem.bestEmpty': '在日记里点 ☆，就会收藏到这里。', 'mem.writeAria': '写日记',

    'notes.title': '纸条', 'notes.empty': '用小纸条传达心意吧，最多60个字。',
    'notes.read': '已读', 'notes.ph': '给对方的纸条', 'notes.send': '发送',
    'time.now': '刚刚', 'time.min': '{n}分钟前', 'time.hour': '{n}小时前',

    'cal.title': '日历', 'cal.prev': '上个月', 'cal.next': '下个月', 'cal.recordDay': '记录这一天',
    'cal.nthDay': '在一起的第{n}天', 'cal.bucketDone': '{emoji} {title} 完成', 'cal.empty': '这一天还没有记录。',
    'anniv.title': '纪念日', 'anniv.add': '添加', 'anniv.ph': '例：对方的生日', 'anniv.yearly': '每年重复',
    'anniv.addBtn': '添加纪念日', 'anniv.confirmDelete': '要删除这个纪念日吗？', 'anniv.deleteAria': '删除纪念日',

    'set.title': '设置', 'set.name': '我的名字', 'set.nameSaved': '名字已修改',
    'set.language': '语言', 'set.languageHint': '界面、推荐心愿、每日问题和发给你的通知都会换成这个语言。对方看到的是自己的语言。',
    'set.font': '字体', 'set.size': '字号', 'set.sample': '我们一起慢慢填满',
    'size.0': '小', 'size.1': '标准', 'size.2': '大', 'size.3': '较大', 'size.4': '最大',
    'set.sizePreview': '今天最开心的瞬间是什么时候？',
    'set.notif': '通知', 'set.ios1': '点击 Safari 底部的“分享”按钮（方框加箭头）', 'set.ios2': '点击“添加到主屏幕”',
    'set.ios3': '从主屏幕的图标重新打开，在这里开启通知',
    'set.denied': '通知已被关闭，请在 iPhone 设置 › 通知 › 우리둘 中允许。',
    'set.notifOn': '开启通知', 'set.notifOff': '关闭通知', 'set.notifOnToast': '通知已开启', 'set.notifOffToast': '通知已关闭',
    'set.test': '发送测试通知', 'set.testSent': '测试通知已发送，请关闭应用稍等',
    'set.notifDesc': '收到纸条、回答、新回忆和完成心愿时会通知你，每天韩国时间晚上9点（北京时间晚上8点）还会推送今日问题。点击通知会直接打开对应页面。',
    'set.us': '我们', 'set.startDate': '在一起的日子', 'set.dateSaved': '日期已保存',
    'set.partner': '另一半：{name}', 'set.partnerPending': '尚未连接（邀请码 {code}）',

    'tab.home': '首页', 'tab.bucket': '心愿', 'tab.q': '问答', 'tab.notes': '纸条', 'tab.cal': '日历',
  },
};

function detect() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved && D[saved]) return saved;
  } catch (e) {}
  const nav = (navigator.language || 'ko').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ko')) return 'ko';
  return 'en';
}

let current = detect();
export const getLang = () => current;
export function setLang(l) {
  if (!D[l]) return;
  current = l;
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : l;
  try { localStorage.setItem('lang', l); } catch (e) {}
}
setLang(current);

export function t(key, params) {
  let s = D[current][key] ?? D.ko[key] ?? key;
  if (params) for (const k in params) s = s.split(`{${k}}`).join(params[k]);
  return s;
}

export function catLabel(cat) {
  return D[current]['cat.' + cat] || cat;
}

// ---------- dates ----------
const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = { ko: '일월화수목금토'.split(''), en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], zh: '日一二三四五六'.split('') };
const WD_LONG = { ko: '일월화수목금토'.split(''), en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] };

export function fmtDateL(y, m, d, wd, withYear) {
  if (current === 'en') return `${WD_LONG.en[wd]}, ${EN_MON[m - 1]} ${d}${withYear ? ', ' + y : ''}`;
  if (current === 'zh') return `${withYear ? y + '年' : ''}${m}月${d}日 ${WD_LONG.zh[wd]}`;
  return `${withYear ? y + '년 ' : ''}${m}월 ${d}일 (${WD_LONG.ko[wd]})`;
}
export function fmtMonth(y, m) {
  if (current === 'en') return `${EN_MONTH[m - 1]} ${y}`;
  if (current === 'zh') return `${y}年${m}月`;
  return `${y}년 ${m}월`;
}

// ---------- fonts per language ----------
// Korean fonts carry Latin glyphs, so English uses the same set; Chinese gets its own.
export const FONTS = {
  ko: [
    { id: 'gowun', name: '고운돋움', desc: '둥글고 다정한 기본 글씨' },
    { id: 'gaegu', name: '개구', desc: '연필로 쓴 손글씨' },
    { id: 'himelody', name: '하이멜로디', desc: '동글동글 손글씨' },
    { id: 'jua', name: '주아', desc: '통통하고 귀여운 글씨' },
    { id: 'batang', name: '고운바탕', desc: '차분한 편지 느낌' },
    { id: 'pretendard', name: '프리텐다드', desc: '깔끔하고 또렷한 글씨' },
  ],
  en: [
    { id: 'gowun', name: 'Gowun Dodum', desc: 'Soft and rounded (default)' },
    { id: 'gaegu', name: 'Gaegu', desc: 'Pencil handwriting' },
    { id: 'himelody', name: 'Hi Melody', desc: 'Bubbly handwriting' },
    { id: 'jua', name: 'Jua', desc: 'Chunky and cute' },
    { id: 'batang', name: 'Gowun Batang', desc: 'Calm, letter-like serif' },
    { id: 'pretendard', name: 'Pretendard', desc: 'Clean and crisp' },
  ],
  zh: [
    { id: 'notosans', name: '思源黑体', desc: '清晰易读（默认）' },
    { id: 'zcool', name: '站酷快乐体', desc: '圆润可爱' },
    { id: 'longcang', name: '龙藏体', desc: '随性手写' },
    { id: 'mashan', name: '马善政毛笔', desc: '毛笔手写' },
    { id: 'notoserif', name: '思源宋体', desc: '安静的书信感' },
  ],
};
export const DEFAULT_FONT = { ko: 'gowun', en: 'gowun', zh: 'notosans' };
export function fontAllowed(lang, id) {
  return FONTS[lang].some((f) => f.id === id);
}
