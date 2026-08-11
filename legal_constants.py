# Legal Knowledge base for procedural checkpoints and statutory mappings

PROCEDURAL_CHECKPOINTS = [
    {
        "id": "magistrate_production",
        "title": "24-Hour Rule",
        "description": "The accused must be produced before a Magistrate within 24 hours of arrest (excluding travel time).",
        "relevant_section": "Section 57 CrPC / Section 58 BNSS",
        "violation_type": "MAJOR"
    },
    {
        "id": "legal_aid",
        "title": "Right to Legal Aid",
        "description": "Right to consult and be defended by a legal practitioner of choice.",
        "relevant_section": "Article 22(1) / Section 303 CrPC",
        "violation_type": "CONSTITUTIONAL"
    },
    {
        "id": "fir_delay",
        "title": "FIR Delay",
        "description": "Unexplained delay in lodging the FIR can weaken the prosecution's case.",
        "relevant_section": "Procedural Precedent",
        "violation_type": "STRATEGIC"
    },
    {
        "id": "section_41_compliance",
        "title": "Arrest Notice (Section 41A)",
        "description": "For offenses with < 7 years punishment, a notice of appearance should typically be given first.",
        "relevant_section": "Section 41A CrPC / Section 35 BNSS",
        "violation_type": "PROCEDURAL"
    }
]

STATUTORY_DEFENSES = {
    "302": ["Right of Private Defense", "Grave and Sudden Provocation", "Exceeding Private Defense", "Sudden Fight/Quarrel"],
    "307": ["Lack of Intention", "Knowledge vs Intent", "Intervening Circumstances"],
    "323": ["Mutual Consent", "Minor Harm", "Self Defense"],
    "376": ["Consent", "False Implication", "Vindictive Prosecution"],
    "498A": ["General Cruelty vs Specific Allegations", "Exaggerated Claims", "Family Settlement"]
}
