/**
 * Fuzzy Search Utility - بحث ذكي يتحمل الأخطاء الإملائية
 * يدعم:
 * - البحث التقريبي (Fuzzy matching)
 * - حساب نسبة التطابق
 * - ترتيب النتائج حسب الأهمية
 * - دعم اللغة العربية والإنجليزية
 */

/**
 * حساب مسافة Levenshtein بين نصين
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number}
 */
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    // إنشاء مصفوفة المسافات
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // تهيئة الصف الأول والعمود الأول
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // حساب المسافة
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // حذف
                dp[i][j - 1] + 1,      // إضافة
                dp[i - 1][j - 1] + cost // استبدال
            );
        }
    }

    return dp[m][n];
}

/**
 * حساب نسبة التشابه بين نصين (0-1)
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number}
 */
function similarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // إذا كان أحدهما يحتوي على الآخر
    if (s1.includes(s2) || s2.includes(s1)) {
        return 0.9;
    }

    // إذا كان أحدهما يبدأ بالآخر
    if (s1.startsWith(s2) || s2.startsWith(s1)) {
        return 0.85;
    }

    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);

    return 1 - (distance / maxLength);
}

/**
 * البحث عن تطابق في نص
 * @param {string} text - النص للبحث فيه
 * @param {string} query - كلمة البحث
 * @param {number} threshold - الحد الأدنى للتشابه (0-1)
 * @returns {object} - { matches: boolean, score: number, matchedPart: string }
 */
function fuzzyMatch(text, query, threshold = 0.3) {
    if (!text || !query) return { matches: false, score: 0, matchedPart: '' };

    const normalizedText = text.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();

    // تطابق مباشر
    if (normalizedText.includes(normalizedQuery)) {
        return {
            matches: true,
            score: 1,
            matchedPart: query,
            exactMatch: true
        };
    }

    // تطابق يبدأ بالكلمة
    if (normalizedText.startsWith(normalizedQuery)) {
        return {
            matches: true,
            score: 0.95,
            matchedPart: text.substring(0, query.length),
            startsWithMatch: true
        };
    }

    // البحث في الكلمات
    const words = normalizedText.split(/\s+/);
    let bestMatch = { matches: false, score: 0, matchedPart: '' };

    for (const word of words) {
        const score = similarity(word, normalizedQuery);
        if (score > bestMatch.score && score >= threshold) {
            bestMatch = {
                matches: true,
                score,
                matchedPart: word,
                fuzzyMatch: true
            };
        }
    }

    // التحقق من التطابق الكلي
    const overallScore = similarity(normalizedText, normalizedQuery);
    if (overallScore > bestMatch.score && overallScore >= threshold) {
        bestMatch = {
            matches: true,
            score: overallScore,
            matchedPart: text,
            fuzzyMatch: true
        };
    }

    return bestMatch;
}

/**
 * البحث في مصفوفة من الكائنات
 * @param {Array} items - العناصر للبحث فيها
 * @param {string} query - كلمة البحث
 * @param {Array<string>} fields - الحقول للبحث فيها
 * @param {object} options - خيارات البحث
 * @returns {Array} - النتائج مرتبة حسب الأهمية
 */
export function fuzzySearch(items, query, fields, options = {}) {
    const {
        threshold = 0.3,
        limit = 50,
        caseSensitive = false
    } = options;

    if (!query || query.trim().length === 0) {
        return items.slice(0, limit);
    }

    const normalizedQuery = caseSensitive ? query.trim() : query.toLowerCase().trim();

    const results = items
        .map(item => {
            let bestScore = 0;
            let bestField = '';
            let matchedPart = '';
            let matchType = '';

            for (const field of fields) {
                const value = getNestedValue(item, field);
                if (!value) continue;

                const textValue = String(value);
                const result = fuzzyMatch(textValue, normalizedQuery, threshold);

                if (result.matches && result.score > bestScore) {
                    bestScore = result.score;
                    bestField = field;
                    matchedPart = result.matchedPart;
                    matchType = result.exactMatch ? 'exact' :
                        result.startsWithMatch ? 'starts' : 'fuzzy';
                }
            }

            return {
                item,
                score: bestScore,
                matchedField: bestField,
                matchedPart,
                matchType
            };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => {
            // ترتيب حسب نوع التطابق أولاً ثم النتيجة
            const typeOrder = { exact: 3, starts: 2, fuzzy: 1 };
            const typeCompare = (typeOrder[b.matchType] || 0) - (typeOrder[a.matchType] || 0);
            if (typeCompare !== 0) return typeCompare;
            return b.score - a.score;
        })
        .slice(0, limit);

    return results;
}

/**
 * الحصول على قيمة متداخلة من كائن
 * @param {object} obj 
 * @param {string} path 
 * @returns {any}
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) =>
        current && current[key] !== undefined ? current[key] : null, obj);
}

/**
 * تمييز النص المطابق في النتيجة
 * @param {string} text - النص الأصلي
 * @param {string} query - كلمة البحث
 * @returns {Array} - مصفوفة من الأجزاء مع علامة التمييز
 */
export function highlightMatch(text, query) {
    if (!text || !query) return [{ text, highlight: false }];

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
        // محاولة إيجاد تطابق جزئي
        const words = text.split(/(\s+)/);
        return words.map(word => {
            const wordLower = word.toLowerCase();
            const similarity = fuzzyMatch(wordLower, lowerQuery, 0.6);
            return {
                text: word,
                highlight: similarity.matches && similarity.score > 0.7
            };
        });
    }

    const parts = [];

    if (index > 0) {
        parts.push({ text: text.substring(0, index), highlight: false });
    }

    parts.push({
        text: text.substring(index, index + query.length),
        highlight: true
    });

    if (index + query.length < text.length) {
        parts.push({
            text: text.substring(index + query.length),
            highlight: false
        });
    }

    return parts;
}

/**
 * البحث السريع مع debounce
 * @param {Function} searchFn - دالة البحث
 * @param {number} delay - التأخير بالمللي ثانية
 * @returns {Function}
 */
export function createDebouncedSearch(searchFn, delay = 150) {
    let timeoutId = null;

    return function (...args) {
        return new Promise((resolve) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                resolve(searchFn(...args));
            }, delay);
        });
    };
}

export default fuzzySearch;
