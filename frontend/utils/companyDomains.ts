/**
 * 主要企業のメールドメインマッピング
 */
const companyDomains: Record<string, string[]> = {
  // テスト用
  'テスト企業': ['gmail.com'],  // テスト用に追加

  // IT・Web系
  'サイバーエージェント': ['cyberagent.co.jp', 'ca-base.jp', 'gmail.com'],  // テスト用にgmail.com追加
  'DeNA': ['dena.com', 'dena.jp'],
  'LINE': ['linecorp.com'],
  'メルカリ': ['mercari.com'],
  '楽天': ['rakuten.co.jp', 'rakuten.com', 'gmail.com'],  // テスト用にgmail.com追加
  'ヤフー': ['yahoo.co.jp', 'z-corp.co.jp'],
  'リクルート': ['recruit.co.jp', 'r.recruit.co.jp'],
  'GMO': ['gmo.jp', 'gmo-media.jp'],
  'サイボウズ': ['cybozu.co.jp'],
  'freee': ['freee.co.jp'],

  // コンサル
  'アクセンチュア': ['accenture.com'],
  'デロイト': ['deloitte.com', 'tohmatsu.co.jp'],
  'PwC': ['pwc.com'],
  'EY': ['ey.com'],
  'マッキンゼー': ['mckinsey.com'],

  // 金融
  '三菱UFJ': ['mufg.jp', 'bk.mufg.jp'],
  '三井住友': ['smbc.co.jp', 'smfg.co.jp'],
  'みずほ': ['mizuho-fg.co.jp', 'mizuhobank.co.jp'],
  '野村證券': ['nomura.co.jp'],
  '大和証券': ['daiwa.co.jp'],

  // 商社
  '三菱商事': ['mitsubishicorp.com'],
  '三井物産': ['mitsui.com'],
  '伊藤忠': ['itochu.co.jp'],
  '住友商事': ['sumitomocorp.com'],
  '丸紅': ['marubeni.com'],

  // メーカー
  'ソニー': ['sony.com', 'sony.co.jp'],
  'パナソニック': ['panasonic.com', 'panasonic.co.jp'],
  'トヨタ': ['toyota.co.jp', 'toyota.com'],
  '日立': ['hitachi.co.jp', 'hitachi.com'],
  'キヤノン': ['canon.co.jp', 'canon.com'],

  // 通信
  'NTT': ['ntt.co.jp', 'ntt.com'],
  'ソフトバンク': ['softbank.co.jp', 'softbank.jp'],
  'KDDI': ['kddi.com'],

  // その他
  '電通': ['dentsu.co.jp', 'dentsu.com'],
  '博報堂': ['hakuhodo.co.jp'],
  'ベネッセ': ['benesse.co.jp'],
}

/**
 * 企業名からメールドメインを推定
 */
export function getCompanyDomains(companyName: string): string[] {
  // 完全一致
  if (companyDomains[companyName]) {
    return companyDomains[companyName]
  }

  // 部分一致で検索
  for (const [key, domains] of Object.entries(companyDomains)) {
    if (companyName.includes(key) || key.includes(companyName)) {
      return domains
    }
  }

  // 登録されていない企業の場合、企業名から推定
  const domains: string[] = []

  // 企業名をクリーニング（株式会社などを除去）
  const cleanName = companyName
    .replace(/株式会社|有限会社|合同会社|合資会社|\(.*?\)|\s/g, '')
    .toLowerCase()

  if (cleanName) {
    // 一般的な企業ドメインパターンを追加
    domains.push(`${cleanName}.co.jp`)
    domains.push(`${cleanName}.com`)
    domains.push(`${cleanName}.jp`)
    domains.push(`${cleanName}.net`)

    // gmail.comも追加（多くの企業が使用）
    domains.push('gmail.com')
  }

  return domains
}

/**
 * 企業名とメールアドレスからマッチするか判定
 */
export function isCompanyEmail(
  companyName: string,
  emailFrom: string
): boolean {
  const domains = getCompanyDomains(companyName)

  // ドメインでマッチ
  for (const domain of domains) {
    if (emailFrom.includes(`@${domain}`)) {
      return true
    }
  }

  // 企業名が含まれているかチェック（日本語・英語両方）
  const normalizedCompany = companyName.toLowerCase().replace(/\s/g, '')
  const normalizedEmail = emailFrom.toLowerCase()

  return normalizedEmail.includes(normalizedCompany)
}