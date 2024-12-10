# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

from .ext import InvenioModularDepositForm

__version__ = "0.3.1-dev0"

__all__ = ("__version__", "InvenioModularDepositForm")
