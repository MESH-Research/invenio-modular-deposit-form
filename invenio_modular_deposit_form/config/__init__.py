# Re-export main config so "from invenio_modular_deposit_form.config import ..." and
# ext.init_config(dir(config)) still work after config.py was moved into config/.
from .config import *  # noqa: F401, F403
