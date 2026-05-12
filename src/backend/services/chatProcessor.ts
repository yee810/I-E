/**
 * Extract preference updates from chat messages.
 * MVP: keyword heuristics. Future: LLM extraction.
 * Returns undefined if no preferences detected.
 */
export function extractPreferenceUpdates(message: string): Record<string, any> | undefined {
  const text = message.toLowerCase();
  const updates: Record<string, any> = {};

  const KNOWN_CITIES = ["北京", "上海", "深圳", "广州", "杭州", "成都", "南京", "武汉", "苏州", "天津", "重庆", "西安", "长沙", "郑州", "青岛", "大连", "宁波", "厦门", "珠海", "合肥", "济南", "福州", "昆明", "贵阳", "海口", "三亚", "东莞", "佛山", "无锡", "常州", "哈尔滨", "沈阳", "长春"];

  // Excluded roles: "不看销售" / "对运营不感兴趣" / "exclude marketing"
  if (text.includes("不看") || text.includes("不感兴趣") || text.includes("exclude")) {
    const match = text.match(/(?:不看|不感兴趣|exclude)\s*(.+)/);
    if (match) {
      updates.excluded_roles = match[1].split(/[,，、]/).map(s => s.trim()).filter(Boolean);
    }
  }

  // Excluded locations: "不想在深圳" / "不要北京的" / "排除上海" / "不想去杭州"
  const negativeLocationPatterns = [
    /不想[在去]?\s*([一-鿿]{2,4})/,
    /不要\s*([一-鿿]{2,4})\s*(?:的|工作|岗位|职位)?/,
    /(?:排除|避开|去掉)\s*([一-鿿]{2,4})/,
    /不想去\s*([一-鿿]{2,4})/,
  ];
  const excludedLocations: string[] = [];
  for (const pat of negativeLocationPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const city = match[1].replace(/的|工作|岗位|职位|就业|发展$/g, "").trim();
      if (city.length >= 2 && KNOWN_CITIES.includes(city)) excludedLocations.push(city);
    }
  }
  if (excludedLocations.length > 0) {
    updates.excluded_locations = excludedLocations;
  }

  // Target roles: "想看前端" / "想做设计" / "prefer backend"
  if (text.includes("想看") || text.includes("想做") || text.includes("prefer")) {
    const match = text.match(/(?:想看|想做|prefer)\s*(.+)/);
    if (match) {
      updates.target_roles = match[1].split(/[,，、]/).map(s => s.trim()).filter(Boolean);
    }
  }

  // Target industries: "想进金融行业" / "想进入互联网行业" / "industry finance"
  if (text.includes("行业") || text.includes("industry")) {
    const match = text.match(/(?:想进|想进入|industry)\s*([\w一-鿿]+)/);
    if (match) {
      const cleaned = match[1].replace(/行业$/, "").trim();
      if (cleaned) {
        updates.target_industries = [cleaned];
      }
    }
  }

  // Target locations — expanded to match many Chinese location patterns
  const COASTAL_CITIES = ["上海", "深圳", "广州", "杭州", "宁波", "厦门", "青岛", "大连", "天津", "珠海", "苏州", "南京"];
  const locationPatterns = [
    // "想去上海" / "prefer Shanghai"
    { regex: /(?:想去|prefer)\s*([一-鿿]{2,4}|[a-z]+)/i, group: 1, strip: /工作|就业|发展$/ },
    // "想要沿海城市(的工作)"
    { regex: /沿海城市/, group: -1, strip: null, cities: COASTAL_CITIES },
    // "在/去/到 上海/北京 工作"
    { regex: /[在去到]\s*([一-鿿]{2,4})\s*工作/, group: 1, strip: null },
    // "上海的工作" / "北京的工作"
    { regex: /([一-鿿]{2,4})的?(?:工作|岗位|职位)/, group: 1, strip: null },
    // "工作地点在上海" / "地点北京"
    { regex: /(?:工作)?地点[在是]?\s*([一-鿿]{2,4})/, group: 1, strip: null },
    // "切换到深圳" / "换成杭州"
    { regex: /(?:切换到?|换成?)\s*([一-鿿]{2,4})/, group: 1, strip: null },
  ];

  for (const pat of locationPatterns) {
    if (pat.cities) {
      const match = text.match(pat.regex);
      if (match) {
        updates.target_locations = pat.cities;
        break;
      }
    } else {
      const match = text.match(pat.regex);
      if (match && match[pat.group]) {
        let city = match[pat.group].trim();
        if (pat.strip) city = city.replace(pat.strip, "").trim();
        // Validate against known cities to avoid false positives like "那就没有"
        if (city.length >= 2 && KNOWN_CITIES.includes(city)) {
          updates.target_locations = [city];
          break;
        }
      }
    }
  }

  // Salary: "薪资8000-15000" / "salary 8000 to 15000"
  if (text.includes("薪资") || text.includes("salary") || text.includes("工资")) {
    const nums = text.match(/\d{1,6}/g)
      ?.map(Number)
      .filter(n => n > 1000 && n < 1000000) ?? [];
    if (nums.length >= 2) {
      updates.salary_min = Math.min(...nums);
      updates.salary_max = Math.max(...nums);
    }
  }

  return Object.keys(updates).length > 0 ? updates : undefined;
}
