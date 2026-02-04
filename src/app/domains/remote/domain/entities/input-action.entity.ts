// ==========================================================================
// DOMAIN ENTITY - Input Action
// ==========================================================================

/**
 * Enum representing Kodi Input actions for remote control navigation
 * Maps to Kodi's JSON-RPC Input.* methods
 */
export enum InputAction {
  Up = 'Input.Up',
  Down = 'Input.Down',
  Left = 'Input.Left',
  Right = 'Input.Right',
  Select = 'Input.Select',
  Back = 'Input.Back',
  Home = 'Input.Home',
  ContextMenu = 'Input.ContextMenu',
  Info = 'Input.Info'
}
