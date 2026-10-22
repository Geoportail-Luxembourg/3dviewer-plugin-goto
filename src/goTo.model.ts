export type GoToListItem = {
  title: string;
  icon?: string;
  clickedCallbacks: Array<(event: PointerEvent) => Promise<void>>;
};
