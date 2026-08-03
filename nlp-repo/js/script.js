/* ===========================================================
   NLP Knowledge Artifact Repository — Data & Interactions
   =========================================================== */

const STOP_WORDS = new Set(["the","is","a","an","of","and","in","on","to","for","it","this","that","i","you","are","was","were","be","been","with","as","at","by","or"]);

/* ---------------- Concept Card Data ---------------- */
const CONCEPTS = [
  {id:"seg", title:"Sentence Segmentation", cat:"Text Preprocessing", author:"You",
   def:"Splitting a block of text into individual sentences using boundary cues such as punctuation and capitalization.",
   purpose:"Many NLP tasks (parsing, translation, summarization) need to operate sentence by sentence rather than on a whole document at once.",
   working:"Rule-based systems look for periods, question marks and exclamation marks while handling abbreviation exceptions; statistical segmenters use trained classifiers to disambiguate tricky boundaries like “Dr.”",
   example:"“Dr. Smith arrived. He was late.” → [“Dr. Smith arrived.”, “He was late.”]",
   adv:"Simple for clean, well-punctuated text; a necessary first pipeline step.",
   lim:"Struggles with abbreviations, ellipses, informal punctuation, and scripts without clear sentence markers.",
   app:"Machine translation, text-to-speech, document summarization."},
  {id:"tok", title:"Tokenization", cat:"Text Preprocessing", author:"You",
   def:"Breaking text into smaller units — words, subwords, or characters — called tokens.",
   purpose:"Converts continuous text into discrete units that models can count, index, and vectorize.",
   working:"Whitespace or rule-based splitting for words; subword algorithms like Byte Pair Encoding (BPE) or WordPiece split rare words into frequent sub-units for modern models.",
   example:"“I'm learning NLP” → [“I”, “'m”, “learning”, “NLP”]",
   adv:"Foundation for every downstream NLP step; subword tokenization handles unseen words gracefully.",
   lim:"Ambiguous for languages without clear word boundaries (e.g. Chinese); contractions and punctuation need special rules.",
   app:"Search indexing, chatbots, all transformer-based models."},
  {id:"case", title:"Case Normalization", cat:"Text Preprocessing", author:"You",
   def:"Converting all text to a consistent case, typically lowercase.",
   purpose:"Reduces vocabulary size so that “NLP” and “nlp” are treated as the same token.",
   working:"A simple string transformation, sometimes applied selectively to preserve proper nouns or acronyms.",
   example:"“Natural Language Processing” → “natural language processing”",
   adv:"Cheap to apply, reduces sparsity, improves matching in search and Bag-of-Words models.",
   lim:"Loses information needed for tasks like Named Entity Recognition, where case distinguishes “Apple” the company from “apple” the fruit.",
   app:"Search engines, bag-of-words models, spam filters."},
  {id:"stop", title:"Stop-word Removal", cat:"Text Preprocessing", author:"You",
   def:"Removing very frequent, low-information words such as “the”, “is”, “and”, “of” from text.",
   purpose:"Reduces noise and dimensionality so models focus on content-bearing words.",
   working:"Each token is checked against a predefined stop-word list and discarded if it matches.",
   example:"“This is a great movie” → [“great”, “movie”]",
   adv:"Speeds up processing and improves the signal-to-noise ratio for Bag-of-Words and TF-IDF models.",
   lim:"Can remove words that carry meaning, such as negations (“not”), and hurts tasks that need full syntax.",
   app:"Search engines, topic modeling, classical text classification."},
  {id:"stem", title:"Stemming", cat:"Text Preprocessing", author:"Riya",
   def:"Reducing a word to its root form by chopping suffixes with fixed rules, without regard to actual grammar.",
   purpose:"Groups word variants like “running”, “runs”, “ran” so they are treated as one feature.",
   working:"Rule-based algorithms such as the Porter Stemmer apply suffix-stripping rules iteratively until no more rules match.",
   example:"“studies”, “studying” → “studi”",
   adv:"Fast, language-independent rules; reduces vocabulary size quickly.",
   lim:"Can produce non-dictionary words and may over- or under-stem, hurting readability and precision.",
   app:"Search engines, information retrieval, quick exploratory text mining."},
  {id:"lem", title:"Lemmatization", cat:"Text Preprocessing", author:"Riya",
   def:"Reducing a word to its dictionary base form (lemma) using vocabulary and grammatical knowledge.",
   purpose:"Provides a linguistically accurate root form, unlike stemming's crude suffix-chopping.",
   working:"Uses morphological analysis and part-of-speech tags with a lexicon (e.g. WordNet) to map inflected forms to their lemma.",
   example:"“better” → “good”, “running” → “run”",
   adv:"More accurate and readable than stemming; preserves actual word meaning.",
   lim:"Slower, and needs POS tagging plus language-specific lexical resources.",
   app:"Chatbots, machine translation, question answering."},
  {id:"noise", title:"Noise Removal", cat:"Text Preprocessing", author:"Riya",
   def:"Stripping irrelevant elements such as HTML tags, special characters, emojis and extra whitespace from raw text.",
   purpose:"Cleans raw scraped or user-generated text before further processing.",
   working:"Regular expressions and rule-based filters detect and remove unwanted patterns.",
   example:"“<p>Great product!! 😀</p>” → “Great product”",
   adv:"Improves data quality and reduces downstream errors.",
   lim:"Overly aggressive rules can strip meaningful signal, since emojis and punctuation can carry sentiment.",
   app:"Web-scraping pipelines, social media analytics."},
  {id:"clean", title:"Text Cleaning", cat:"Text Preprocessing", author:"Riya",
   def:"The umbrella process combining noise removal, whitespace fixing, spelling correction and encoding fixes into one clean pass.",
   purpose:"Ensures consistent, error-free text before tokenization and modeling begin.",
   working:"A pipeline of regex rules, encoding converters and optional spell-checkers applied sequentially to the corpus.",
   example:"“Th1s   is  a tst” → “This is a test”",
   adv:"Improves model accuracy and consistency across an entire corpus.",
   lim:"No universal recipe — rules must be tailored to the domain, or useful signal can be removed by mistake.",
   app:"Any real-world pipeline handling raw text: reviews, tweets, OCR output."},
  {id:"bow", title:"Bag of Words", cat:"Feature Engineering", author:"You",
   def:"A representation that describes text as an unordered collection (“bag”) of word counts, ignoring grammar and order.",
   purpose:"Converts text into fixed-length numeric vectors that classic machine-learning models can consume.",
   working:"Build a vocabulary of all unique words in the corpus, then represent each document as a vector of word frequencies over that vocabulary.",
   example:"“cat sat on mat” → {cat:1, sat:1, on:1, mat:1}",
   adv:"Simple, interpretable and fast to compute.",
   lim:"Ignores word order and context, and produces high-dimensional, sparse vectors.",
   app:"Spam detection, basic text classification, document similarity."},
  {id:"ngram", title:"N-Grams", cat:"Feature Engineering", author:"You",
   def:"Contiguous sequences of N words (or characters) extracted from a text.",
   purpose:"Captures local word order and phrase-level context that Bag of Words misses entirely.",
   working:"Slide a window of size N across the token sequence, collecting each contiguous group as a feature.",
   example:"Bigrams of “I love NLP” → [“I love”, “love NLP”]",
   adv:"Captures short-range context such as negation and common phrases.",
   lim:"The feature space grows exponentially with N, and sparsity increases quickly.",
   app:"Language modeling, autocomplete, spelling correction."},
  {id:"tf", title:"TF (Term Frequency)", cat:"Feature Engineering", author:"You",
   def:"A measure of how often a term appears within a single document, usually normalized by document length.",
   purpose:"Highlights words that appear frequently within a specific document.",
   working:"TF(t,d) = (count of term t in document d) / (total terms in d).",
   example:"If “NLP” appears 5 times in a 100-word document, TF(“NLP”) = 0.05.",
   adv:"Simple, quick to compute, reflects local importance.",
   lim:"Common but uninformative words can score highly without additional weighting.",
   app:"Search ranking, document similarity, and as an input to TF-IDF."},
  {id:"idf", title:"IDF (Inverse Document Frequency)", cat:"Feature Engineering", author:"Riya",
   def:"A measure of how rare or common a term is across an entire corpus of documents.",
   purpose:"Down-weights terms that appear in many documents and up-weights rare, informative terms.",
   working:"IDF(t) = log(Total documents / Documents containing t).",
   example:"A word in every document gets IDF ≈ 0; a rare word gets a high IDF score.",
   adv:"Distinguishes distinctive terms from generic ones across a whole collection.",
   lim:"Requires full corpus statistics in advance and is sensitive to corpus size and composition.",
   app:"Search engines, keyword extraction, TF-IDF weighting."},
  {id:"tfidf", title:"TF-IDF", cat:"Feature Engineering", author:"Riya",
   def:"A composite score combining Term Frequency and Inverse Document Frequency to weigh a word's importance to a document relative to a corpus.",
   purpose:"Balances local frequency with corpus-wide rarity to surface genuinely distinctive terms.",
   working:"TF-IDF(t,d) = TF(t,d) × IDF(t).",
   example:"“NLP”, frequent in one document but rare corpus-wide, scores high; “the” scores near zero.",
   adv:"Better feature weighting than raw counts, widely supported and easy to interpret.",
   lim:"Still ignores word order and semantics, and struggles with synonyms and short texts.",
   app:"Search engines, document ranking, keyword extraction, classical text classifiers."},
  {id:"ohe", title:"One-Hot Encoding", cat:"Language Representation", author:"You",
   def:"Representing each word as a binary vector with a single 1 at the word's index in the vocabulary and 0s elsewhere.",
   purpose:"Provides a basic, unambiguous numeric representation of word data for models.",
   working:"Assign each vocabulary word a unique index; the resulting vector length equals the vocabulary size.",
   example:"Vocabulary [cat, dog, fish] → “dog” = [0,1,0]",
   adv:"Simple and unambiguous encoding.",
   lim:"Extremely high-dimensional and sparse for large vocabularies, with no notion of similarity between words.",
   app:"Small-vocabulary categorical features, baseline NLP experiments."},
  {id:"emb", title:"Word Embeddings", cat:"Language Representation", author:"You",
   def:"Dense, low-dimensional vector representations of words that capture semantic relationships.",
   purpose:"Overcomes One-Hot Encoding's sparsity and lack of similarity by placing related words close together in vector space.",
   working:"Trained on large corpora so that words appearing in similar contexts end up with similar vectors (the distributional hypothesis).",
   example:"vector(“king”) − vector(“man”) + vector(“woman”) ≈ vector(“queen”)",
   adv:"Compact, captures semantic and syntactic similarity, and transfers well across tasks.",
   lim:"Static — one vector per word regardless of context, so it can't distinguish a river “bank” from a financial “bank.”",
   app:"Sentiment analysis, recommendation systems, semantic search."},
  {id:"w2v", title:"Word2Vec", cat:"Language Representation", author:"Riya",
   def:"A neural word-embedding technique that learns vectors by predicting a word from its context (CBOW) or a context from a word (Skip-gram).",
   purpose:"Produces high-quality, semantically meaningful embeddings efficiently from large text corpora.",
   working:"A shallow neural network is trained on sliding context windows; the learned hidden-layer weights become the word vectors.",
   example:"“Paris” and “France” end up in a vector relationship similar to “Tokyo” and “Japan.”",
   adv:"Fast to train and captures useful semantic analogies.",
   lim:"Cannot handle out-of-vocabulary words and ignores subword structure and context at inference time.",
   app:"Recommendation engines, semantic search, document clustering."},
  {id:"ft", title:"FastText", cat:"Language Representation", author:"Riya",
   def:"An extension of Word2Vec that represents words as combinations of character n-grams (subwords).",
   purpose:"Handles rare and out-of-vocabulary words, and works well for morphologically rich languages.",
   working:"A word's embedding is the sum of its character n-gram embeddings, so even unseen words get a reasonable vector.",
   example:"“unhappiness” is built from subwords like “un”, “happi”, “ness”, so it works even if the full word was never seen in training.",
   adv:"Robust to spelling variation, typos and rare words; strong for morphologically complex languages.",
   lim:"Larger model size from the n-gram vocabulary, and still produces static, non-contextual embeddings.",
   app:"Multilingual NLP, text classification for low-resource languages."},
  {id:"ctx", title:"Contextual Embeddings", cat:"Language Representation", author:"Riya",
   def:"Word representations that change depending on surrounding context, generated by deep models such as BERT or ELMo.",
   purpose:"Resolves the ambiguity of static embeddings by giving the same word different vectors in different contexts.",
   working:"Deep bidirectional or transformer networks process a whole sentence and output a vector for each word conditioned on its context.",
   example:"“bank” in “river bank” vs. “bank account” receives two different embeddings.",
   adv:"State-of-the-art accuracy on almost all NLP tasks; captures polysemy and syntax.",
   lim:"Computationally expensive to train and run, requiring large models and data.",
   app:"Question answering, machine translation, chatbots, search ranking."},
  {id:"slm", title:"Statistical Language Models", cat:"Language Models", author:"You",
   def:"Models that estimate the probability of a word sequence using statistical counts, most commonly n-gram probabilities.",
   purpose:"Predicts how likely a next word or whole sentence is, useful for autocomplete and speech recognition.",
   working:"Applies the chain rule of probability with a Markov assumption — e.g. a trigram model approximates P(word | history) using only the previous two words, estimated from corpus counts with smoothing for unseen n-grams.",
   example:"A bigram model estimates P(“processing” | “language”) from how often that pair occurs in training text.",
   adv:"Simple, interpretable, and fast to train on modest data.",
   lim:"Suffers from data sparsity for higher-order n-grams and can't capture long-range dependencies.",
   app:"Early speech recognition, spelling correction, simple autocomplete."},
  {id:"nlm", title:"Neural Language Models", cat:"Language Models", author:"Riya",
   def:"Models that use neural networks (RNNs, LSTMs) to predict word sequences, learning distributed representations instead of relying on raw counts.",
   purpose:"Captures longer-range dependencies and generalizes better to unseen word combinations than statistical models.",
   working:"A recurrent network processes tokens sequentially, maintaining a hidden state that summarizes prior context to predict the next token.",
   example:"An LSTM trained on news text can predict “president” after “the … of the United States.”",
   adv:"Handles longer context and generalizes via learned embeddings rather than raw counts.",
   lim:"Sequential processing is slow to train and struggles with very long-range dependencies (vanishing gradients).",
   app:"Text generation, early machine translation systems, predictive-text keyboards."},
  {id:"trf", title:"Transformer-based Representations", cat:"Language Models", author:"You",
   def:"Representations produced by the Transformer architecture, which uses self-attention to relate every word in a sequence to every other word directly.",
   purpose:"Solves the long-range dependency and parallelization limits of RNN-based models, enabling today's large language models.",
   working:"Self-attention layers compute weighted relationships between all token pairs in parallel, stacked across many layers, typically pre-trained on massive corpora and then fine-tuned for tasks.",
   example:"BERT and GPT are both Transformer-based: BERT reads bidirectionally for understanding, GPT reads left-to-right for generation.",
   adv:"Captures long-range dependencies, trains in parallel, and transfers extremely well across tasks.",
   lim:"Very high computational and memory cost; needs massive data and compute to train from scratch.",
   app:"Chatbots, machine translation, summarization — virtually all modern large language models."},
];

/* ---------------- Comparative Analysis Data ---------------- */
const COMPARISONS = [
  {title:"Stemming vs Lemmatization", author:"Riya",
   rows:[
    ["Working mechanism","Chops suffixes using fixed rules, regardless of grammar.","Uses a lexicon and POS tags to find the true dictionary form."],
    ["Computational complexity","Low — direct rule lookup.","Higher — needs POS tagging and lexicon lookup."],
    ["Strengths","Fast, no linguistic resources required.","Accurate, produces real, readable words."],
    ["Weaknesses","Can produce non-words; less precise.","Slower; needs language-specific resources."],
    ["Suitable applications","Search engines, large-scale information retrieval.","Chatbots, translation, question answering."]
   ]},
  {title:"TF vs TF-IDF", author:"You",
   rows:[
    ["Working mechanism","Counts raw term frequency within one document.","Multiplies term frequency by inverse document frequency across the corpus."],
    ["Computational complexity","O(document length).","Higher — needs corpus-wide document-frequency statistics."],
    ["Strengths","Simple; useful for single-document analysis.","Highlights genuinely distinctive terms across a corpus."],
    ["Weaknesses","Treats stop-words as if they were important.","Still ignores word order and semantics."],
    ["Suitable applications","Quick word-frequency analysis.","Search ranking, keyword extraction, document classification."]
   ]},
  {title:"Word2Vec vs FastText", author:"Joint",
   rows:[
    ["Working mechanism","Learns one dense vector per whole word from its context.","Builds a word's vector from its character n-grams (subwords)."],
    ["Computational complexity","Lighter, faster to train.","Higher — larger n-gram vocabulary to learn."],
    ["Strengths","Fast; strong on frequent, well-represented words.","Handles rare and unseen words and morphology well."],
    ["Weaknesses","Fails completely on out-of-vocabulary words.","Larger model size; slower training."],
    ["Suitable applications","Semantic search on large, clean corpora.","Multilingual and morphologically rich languages, noisy user text."]
   ]}
];

/* ---------------- Applications Data ---------------- */
const APPLICATIONS = [
  {title:"Search Engines", author:"You", concepts:["Tokenization","Stop-word Removal","TF-IDF","Word Embeddings"],
   why:"Search must match a query's intent to relevant documents, not just exact keyword strings.",
   benefit:"Faster, more relevant results, even when the query and document use different wording."},
  {title:"Chatbots", author:"Riya", concepts:["Tokenization","Lemmatization","Contextual Embeddings","Language Models"],
   why:"A chatbot has to understand user intent from imperfect, conversational text and generate a coherent reply.",
   benefit:"Round-the-clock automated support with increasingly natural conversation."},
  {title:"Sentiment Analysis", author:"You", concepts:["Case Normalization","TF-IDF","Word Embeddings"],
   why:"Businesses need to gauge opinion at a scale no human team could read manually.",
   benefit:"Brand monitoring and product feedback analysis across thousands of reviews in minutes."},
  {title:"Machine Translation", author:"Riya", concepts:["Tokenization","Contextual Embeddings","Transformer-based Representations"],
   why:"Bridging language barriers automatically requires understanding meaning, not just word-for-word swaps.",
   benefit:"Faster localization and everyday communication across languages."},
  {title:"Text Summarization", author:"You", concepts:["Sentence Segmentation","TF-IDF","Transformer-based Representations"],
   why:"Long documents and articles need to be condensed into their key points without losing meaning.",
   benefit:"Saves reading time and speeds up research and news consumption."}
];

/* ---------------- Rendering ---------------- */
function renderConcepts(filter="All"){
  const grid = document.getElementById("concept-grid");
  grid.innerHTML = "";
  CONCEPTS.filter(c => filter === "All" || c.cat === filter).forEach(c => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-top">
        <h3>${c.title}</h3>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          <span class="tag cat">${c.cat}</span>
          <span class="tag author">${c.author}</span>
        </div>
      </div>
      <dl>
        <dt>Definition</dt><dd>${c.def}</dd>
        <dt>Purpose</dt><dd>${c.purpose}</dd>
        <dt>Working Principle</dt><dd>${c.working}</dd>
        <dt>Example</dt><dd><code>${c.example}</code></dd>
        <dt>Advantages</dt><dd>${c.adv}</dd>
        <dt>Limitations</dt><dd>${c.lim}</dd>
        <dt>Applications</dt><dd>${c.app}</dd>
      </dl>`;
    grid.appendChild(el);
  });
  document.getElementById("concept-count").textContent = grid.children.length;
}

function renderComparisons(){
  const wrap = document.getElementById("comparison-list");
  wrap.innerHTML = "";
  COMPARISONS.forEach(c => {
    const pillClass = c.author === "You" ? "you" : c.author === "Riya" ? "riya" : "joint";
    const el = document.createElement("div");
    el.className = "compare-card";
    el.innerHTML = `
      <h3>${c.title}</h3>
      <span class="pill ${pillClass}">${c.author}</span>
      <table class="compare">
        <tr><th>Aspect</th><th>${c.title.split(" vs ")[0]}</th><th>${c.title.split(" vs ")[1]}</th></tr>
        ${c.rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
      </table>`;
    wrap.appendChild(el);
  });
}

function renderApplications(){
  const grid = document.getElementById("app-grid");
  grid.innerHTML = "";
  APPLICATIONS.forEach(a => {
    const pillClass = a.author === "You" ? "you" : "riya";
    const el = document.createElement("div");
    el.className = "app-card";
    el.innerHTML = `
      <div class="card-top"><h3>${a.title}</h3><span class="pill ${pillClass}">${a.author}</span></div>
      <div class="concepts">${a.concepts.map(c => `<span>${c}</span>`).join("")}</div>
      <p style="color:var(--paper-dim); font-size:0.9rem;"><strong style="color:var(--paper)">Why it's needed: </strong>${a.why}</p>
      <p style="color:var(--paper-dim); font-size:0.9rem;"><strong style="color:var(--paper)">Expected benefit: </strong>${a.benefit}</p>`;
    grid.appendChild(el);
  });
}

/* ---------------- Tabs / Navigation ---------------- */
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
  const page = document.getElementById(id);
  if(page) page.classList.add("active");
  const btn = document.querySelector(`nav.tabs button[data-target="${id}"]`);
  if(btn) btn.classList.add("active");
  window.scrollTo({top: 0, behavior: "instant"});
  history.replaceState(null, "", "#" + id);
}

function initNav(){
  document.querySelectorAll("nav.tabs button").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.target));
  });
  document.querySelectorAll("[data-goto]").forEach(el => {
    el.addEventListener("click", (e) => { e.preventDefault(); showPage(el.dataset.goto); });
  });
  const hash = window.location.hash.replace("#", "");
  showPage(hash && document.getElementById(hash) ? hash : "home");
}

/* ---------------- Live Tokenizer Demo (signature element) ---------------- */
function initTokenizer(){
  const input = document.getElementById("tokenizer-input");
  const output = document.getElementById("token-output");
  const meta = document.getElementById("token-meta");
  function run(){
    const text = input.value.trim();
    output.innerHTML = "";
    if(!text){ meta.textContent = "Type a sentence above to watch tokenization + stop-word detection run live."; return; }
    const tokens = text.match(/[\w']+|[.,!?;]/g) || [];
    let stopCount = 0;
    tokens.forEach(t => {
      const isStop = STOP_WORDS.has(t.toLowerCase());
      if(isStop) stopCount++;
      const chip = document.createElement("span");
      chip.className = "token-chip" + (isStop ? " stop" : "");
      chip.textContent = t;
      output.appendChild(chip);
    });
    meta.textContent = `${tokens.length} tokens · ${stopCount} flagged as stop-words · ${tokens.length - stopCount} content tokens remain`;
  }
  input.addEventListener("input", run);
  input.value = "The quick brown fox jumps over the lazy dog";
  run();
}

/* ---------------- Concept filter buttons ---------------- */
function initFilters(){
  document.querySelectorAll(".filter-row button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-row button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderConcepts(btn.dataset.filter);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderConcepts();
  renderComparisons();
  renderApplications();
  initNav();
  initFilters();
  initTokenizer();
});
