#!/usr/bin/env python
"""
CareerSphere AI — Autonomous Test Runner & Codebase Auditor
Phase 1 Foundation
"""
import os
import sys
import unittest
import py_compile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def audit_python_syntax():
    """Compiles all Python files in the backend tree to ensure zero syntax errors."""
    print("=" * 70)
    print("AUDITING PYTHON SYNTAX ACROSS ALL BACKEND APPS")
    print("=" * 70)
    syntax_errors = []
    checked_count = 0

    for py_file in BASE_DIR.rglob("*.py"):
        # Skip virtualenvs or cache if present
        if any(part in py_file.parts for part in ["venv", ".venv", "__pycache__"]):
            continue
        try:
            py_compile.compile(str(py_file), doraise=True)
            checked_count += 1
        except py_compile.PyCompileError as e:
            syntax_errors.append((str(py_file), str(e)))

    if syntax_errors:
        print(f"FAILED: Found {len(syntax_errors)} syntax errors:")
        for path, err in syntax_errors:
            print(f"  [X] {path}: {err}")
        return False

    print(f"PASSED: All {checked_count} Python backend files compiled cleanly with 0 syntax errors.\n")
    return True


def run_unit_tests():
    """Runs all backend unit tests using Python's standard unittest framework."""
    print("=" * 70)
    print("RUNNING UNIT TEST SUITE")
    print("=" * 70)
    loader = unittest.TestLoader()
    suite = loader.discover(str(BASE_DIR / "tests"), pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


def main():
    syntax_ok = audit_python_syntax()
    tests_ok = run_unit_tests()

    print("=" * 70)
    if syntax_ok and tests_ok:
        print("ALL BACKEND CHECKS AND UNIT TESTS PASSED SUCCESSFULLY.")
        print("=" * 70)
        sys.exit(0)
    else:
        print("BACKEND VERIFICATION FAILED.")
        print("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
