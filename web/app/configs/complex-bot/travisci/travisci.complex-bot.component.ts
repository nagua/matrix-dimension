import { ComplexBotComponent } from "../complex-bot.component";
import { Component } from "@angular/core";
import { SessionStorage } from "../../../shared/SessionStorage";

interface TravisCiConfig {
    webhookUrl: string; // TODO: Display webhook URL somewhere
    repos: {
        [repoKey: string]: { // "turt2live/matrix-dimension"
            addedByUserId: string;
            template: string;
        };
    };
}

interface LocalRepo {
    repoKey: string;
    template: string;
    addedByUserId: string;
    isSelf: boolean;
}

@Component({
    templateUrl: "travisci.complex-bot.component.html",
    styleUrls: ["travisci.complex-bot.component.scss"],
})
export class TravisCiComplexBotConfigComponent extends ComplexBotComponent<TravisCiConfig> {

    public newRepoKey = "";

    constructor() {
        super("travisci");
    }

    public addRepo(): void {
        if (!this.newRepoKey.trim()) {
            this.toaster.pop('warning', 'Please enter a repository');
            return;
        }

        this.newConfig.repos[this.newRepoKey] = {addedByUserId: SessionStorage.userId, template: "TODO: Default template"};
        this.newRepoKey = "";
    }

    public getRepos(): LocalRepo[] {
        if (!this.newConfig.repos) this.newConfig.repos = {};
        return Object.keys(this.newConfig.repos).map(r => {
            return {
                repoKey: r,
                template: this.newConfig.repos[r].template,
                addedByUserId: this.newConfig.repos[r].addedByUserId,
                isSelf: SessionStorage.userId === this.newConfig.repos[r].addedByUserId,
            };
        });
    }

    public removeRepo(repo: LocalRepo): void {
        delete this.newConfig.repos[repo.repoKey];
    }

    public async interceptSave(): Promise<any> {
        const memberEvent = await this.scalarClientApi.getMembershipState(this.roomId, this.bot.notificationUserId);
        const isJoined = memberEvent && memberEvent.response && ["join", "invite"].indexOf(memberEvent.response.membership) !== -1;

        if (!isJoined) {
            await this.scalarClientApi.inviteUser(this.roomId, this.bot.notificationUserId);
        }

        super.save();
    }
}