import { Component, ViewChild } from '@angular/core';
import { IdeaList } from './components/idea-list/idea-list';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.html'
})
export class App {
  // 👇 Get a reference to the IdeaList component
  @ViewChild('ideaList') ideaListComponent!: IdeaList;

  // ✅ Called when ideaSaved is emitted from IdeaForm
  onIdeaSaved() {
    console.log("🔁 App received ideaSaved — refreshing idea list...");
    this.ideaListComponent.refreshIdeas();
  }
}
